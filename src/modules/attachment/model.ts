import { z } from 'zod';

export const Attachment = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  storageKey: z.string(),
  status: z.enum(['pending', 'scanning', 'clean', 'infected', 'error']),
  createdAt: z.date().nullable().optional(),
});

export const UploadAttachment = {
  params: z.object({
    taskId: z.uuid(),
  }),
  body: z.object({
    file: z.instanceof(File),
  }),
  response: Attachment,
};

export const GetAttachments = {
  params: z.object({
    taskId: z.uuid(),
  }),
  response: z.object({
    attachments: z.array(Attachment),
  }),
};

export const GetAttachmentsByTasks = {
  query: z.object({
    taskIds: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  response: z.object({
    attachments: z.array(Attachment),
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
