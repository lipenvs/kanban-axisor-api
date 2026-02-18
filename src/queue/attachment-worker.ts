import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { attachment } from "../database/schema/attachment";
import { env } from "../env";

const worker = new Worker(
  "attachment-scan",
  async (job) => {
    const { attachmentId } = job.data as { attachmentId: string };

    // Update status to "scanning"
    await db
      .update(attachment)
      .set({ status: "scanning" })
      .where(eq(attachment.id, attachmentId));

    // Simulate virus scan with 5s delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Mark as clean
    await db
      .update(attachment)
      .set({ status: "clean" })
      .where(eq(attachment.id, attachmentId));
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  console.error(`Attachment scan job ${job?.id} failed:`, err.message);
});

export { worker as attachmentWorker };
