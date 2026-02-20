import { Queue } from "bullmq";
import { env } from "../env";

export interface AttachmentScanJob {
  attachmentId: string;
}

export interface AttachmentDeleteJob {
  storageKeys: string[];
}

export const attachmentQueue = new Queue<AttachmentScanJob>("attachment-scan", {
  connection: { url: env.REDIS_URL },
});

export const attachmentDeleteQueue = new Queue<AttachmentDeleteJob>("attachment-delete", {
  connection: { url: env.REDIS_URL },
});