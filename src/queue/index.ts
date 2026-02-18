import { Queue } from "bullmq";
import { env } from "../env";

export const attachmentQueue = new Queue("attachment-scan", {
  connection: { url: env.REDIS_URL },
});
