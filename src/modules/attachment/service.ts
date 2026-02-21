import { eq } from "drizzle-orm";
import { db } from "../../database/client";
import { attachment } from "../../database/schema/attachment";
import { s3 } from "../../utils/s3";
import { attachmentDeleteQueue, attachmentQueue } from "../../queue";
import { task } from "../../database/schema";

export abstract class AttachmentService {
  static async upload(taskId: string, file: File) {
    const storageKey = `${taskId}/${crypto.randomUUID()}-${file.name}`;

    const [created] = await db
      .insert(attachment)
      .values({
        taskId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storageKey,
        status: "pending",
      })
      .returning();

    await s3.write(storageKey, file);

    await attachmentQueue.add("scan", { attachmentId: created.id });

    return created;
  }

  static async getByTaskId(taskId: string) {
    return db
      .select()
      .from(attachment)
      .where(eq(attachment.taskId, taskId));
  }

  static async getByTaskIds(taskIds: string[]) {
    if (taskIds.length === 0) return [];

    const { inArray } = await import("drizzle-orm");
    return db
      .select()
      .from(attachment)
      .where(inArray(attachment.taskId, taskIds));
  }

  static async getById(id: string) {
    const [found] = await db
      .select()
      .from(attachment)
      .where(eq(attachment.id, id));
    return found;
  }

  static async delete(id: string) {
    const found = await this.getById(id);
    if (!found) return;

    await db.delete(attachment).where(eq(attachment.id, id));

    await attachmentDeleteQueue.add("attachment-delete", {
      storageKeys: [found.storageKey],
    });
  }

  static async deleteByTaskId(taskId: string) {
    const attachments = await db
      .select({ storageKey: attachment.storageKey })
      .from(attachment)
      .where(eq(attachment.taskId, taskId));

    if (attachments.length === 0) return;

    await db.delete(attachment).where(eq(attachment.taskId, taskId));

    await attachmentDeleteQueue.add("attachment-delete", {
      storageKeys: attachments.map((a) => a.storageKey),
    });
  }

  static async getPresignedUrl(id: string) {
    const [found] = await db
      .select()
      .from(attachment)
      .where(eq(attachment.id, id));
    if (!found) return null;
    return s3.presign(found.storageKey, { expiresIn: 3600 });
  }
}
