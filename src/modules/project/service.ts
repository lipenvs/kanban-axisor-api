import { and, ilike, SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../../database/client";
import { attachment, column, project, task } from "../../database/schema";
import { attachmentDeleteQueue } from "../../queue";

export abstract class ProjectService {
  static async create(name: string, userId: string) {
    const [created] = await db.insert(project).values({
      name,
      userId,
    }).returning({ id: project.id, name: project.name });

    return created;
  }

  static async getAll(search?: string) {
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(project.name, `%${search}%`));
    }

    return db.select().from(project).where(and(...conditions));
  }

  static async update(id: string, name: string) {
    await db.update(project).set({ name }).where(eq(project.id, id));
  }

  static async delete(id: string) {
  const attachments = await db
    .select({ storageKey: attachment.storageKey })
    .from(attachment)
    .innerJoin(task, eq(attachment.taskId, task.id))
    .innerJoin(column, eq(task.columnId, column.id))
    .where(eq(column.projectId, id));

  await db.delete(project).where(eq(project.id, id));

  if (attachments.length > 0) {
    await attachmentDeleteQueue.add("attachment-delete", {
      storageKeys: attachments.map((a) => a.storageKey),
    });
  }
}
}
