import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { attachment } from '../../database/schema';

export const AttachmentSchema = createSelectSchema(attachment)

export const UploadAttachment = {
  params: z.object({
    taskId: z.uuid(),
  }),
  body: z.object({
    file: z.instanceof(File),
  }),
  response: AttachmentSchema,
};

export const GetAttachments = {
  params: z.object({
    taskId: z.uuid(),
  }),
  response: z.object({
    attachments: z.array(AttachmentSchema),
  }),
};

export const GetAttachmentsByTasks = {
  query: z.object({
    taskIds: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  response: z.object({
    attachments: z.array(AttachmentSchema),
  }),
};

export const DownloadAttachment = {
  params: z.object({
    id: z.uuid(),
  }),
  response: z.object({
    url: z.string(),
  }),
};

export const DeleteAttachment = {
  params: z.object({
    id: z.uuid(),
  }),
  response: z.object({
    success: z.boolean(),
  }),
};
