import { Queue } from "bullmq";
import { env } from "../env";

export interface AttachmentScanJob {
  attachmentId: string;
  taskId: string;
  userId?: string;
}

export const attachmentQueue = new Queue<AttachmentScanJob>("attachment-scan", {
  connection: { url: env.REDIS_URL },
});
