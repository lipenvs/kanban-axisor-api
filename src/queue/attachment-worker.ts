import { Worker, Job } from "bullmq";
import { db } from "../database/client";
import { attachment } from "../database/schema/attachment";
import { eq } from "drizzle-orm";
import { env } from "../env";
import { s3 } from "../utils/s3";
import { AttachmentScanJob } from "./index";
import { attachmentScan } from "../utils/attachmentScan";
import { broadcastToUser, broadcastToTask } from "../websocket";

const worker = new Worker<AttachmentScanJob>(
  "attachment-scan",
  async (job: Job<AttachmentScanJob>) => {
    const { attachmentId, taskId, userId } = job.data;

    const [record] = await db.select().from(attachment).where(eq(attachment.id, attachmentId));
    if (!record) return;

    await db.update(attachment).set({ status: "scanning" }).where(eq(attachment.id, attachmentId));

    if (userId) {
      broadcastToUser(userId, "attachment:scanning", {
        attachmentId,
        taskId,
        fileName: record.fileName,
      });
    }
    broadcastToTask(taskId, "attachment:scanning", {
      attachmentId,
      taskId,
      fileName: record.fileName,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const status = await attachmentScan(record.fileName);

    if (userId) {
      broadcastToUser(userId, "attachment:saving", {
        attachmentId,
        taskId,
        fileName: record.fileName,
      });
    }
    broadcastToTask(taskId, "attachment:saving", {
      attachmentId,
      taskId,
      fileName: record.fileName,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (status === "infected") {
      try {
        await s3.delete(record.storageKey);
      } catch (err) {
        console.error("Failed to delete infected file:", err);
      }
    }

    await db.update(attachment).set({ status }).where(eq(attachment.id, attachmentId));

    const attachments = await db
      .select()
      .from(attachment)
      .where(eq(attachment.taskId, taskId));

    if (userId) {
      broadcastToUser(userId, "attachment:completed", {
        attachmentId,
        taskId,
        fileName: record.fileName,
        status,
        attachmentCount: attachments.length,
      });
    }
    broadcastToTask(taskId, "attachment:completed", {
      attachmentId,
      taskId,
      fileName: record.fileName,
      status,
      attachmentCount: attachments.length,
    });

    if (status === "error") {
      throw new Error("Simulated scan failure");
    }
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 5,
  }
);

worker.on("failed", async (job, err) => {
  if (job?.data?.attachmentId) {
    await db.update(attachment).set({ status: "error" }).where(eq(attachment.id, job.data.attachmentId));
  }
  console.error(`Attachment scan job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => console.error("Worker connection error:", err));

export { worker as attachmentWorker };
