import { S3Client } from "bun";
import { env } from "../../env";

export const s3 = new S3Client({
  accessKeyId: env.MINIO_ROOT_USER,
  secretAccessKey: env.MINIO_ROOT_PASSWORD,
  bucket: env.MINIO_BUCKET,
  endpoint: env.MINIO_ENDPOINT,
});