import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../../env";

export const s3 = new S3Client({
  region: "us-east-1",
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ROOT_USER,
    secretAccessKey: env.S3_ROOT_PASSWORD,
  },
  forcePathStyle: true,
});