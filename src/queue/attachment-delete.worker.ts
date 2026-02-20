import { Worker, Job } from "bullmq";
import { env } from "../env";
import { s3 } from "../utils/s3";
import { AttachmentDeleteJob } from "./index";

const worker = new Worker<AttachmentDeleteJob>(
  "attachment-delete",
  async (job: Job<AttachmentDeleteJob>) => {
    const { storageKeys } = job.data;

    await Promise.all(storageKeys.map((key) => s3.delete(key)));
  },
  {
    connection: { url: env.REDIS_URL },
    concurrency: 5,
  }
);

worker.on("failed", (job, err) => {
  console.error(`Attachment delete job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => console.error("Worker connection error:", err));

export { worker as attachmentDeleteWorker };