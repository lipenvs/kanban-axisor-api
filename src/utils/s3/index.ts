import { S3Client } from "bun";
import { env } from "../../env";

export const s3 = new S3Client({
  accessKeyId: env.S3_ROOT_USER,
  secretAccessKey: env.S3_ROOT_PASSWORD,
  bucket: env.S3_BUCKET,
  endpoint: env.S3_ENDPOINT,
});