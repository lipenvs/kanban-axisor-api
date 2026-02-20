import { Elysia, t } from "elysia";
import { authPlugin } from "../better-auth";
import { AttachmentService } from "./service";
import {
  UploadAttachment,
  GetAttachments,
  GetAttachmentsByTasks,
  DownloadAttachment,
  DeleteAttachment,
} from "./model";

export const attachmentController = new Elysia({ prefix: "/attachments" })
  .use(authPlugin)
  .post(
    "/upload/:taskId",
    async ({ params, body, set }) => {
      const file = body.file;
      if (!file.type.includes("pdf")) {
        set.status = 400;
        return { error: "Only PDF files are allowed" };
      }

      const created = await AttachmentService.upload(params.taskId, file);
      set.status = 201;
      return created;
    },
    {
      auth: true,
      params: UploadAttachment.params,
      body: t.Object({
        file: t.File()
      }),
      response: {
        201: UploadAttachment.response,
      },
      detail: {
        operationId: "postAttachmentsUploadByTaskId",
        tags: ["Attachment"],
        responses: {
          201: { description: "File uploaded and queued for processing" },
        },
      },
    }
  )
  .get(
    "/:taskId",
    async ({ params, set }) => {
      const attachments = await AttachmentService.getByTaskId(params.taskId);
      set.status = 200;
      return { attachments };
    },
    {
      auth: true,
      params: GetAttachments.params,
      response: {
        200: GetAttachments.response,
      },
      detail: {
        operationId: "getAttachmentsByTaskId",
        tags: ["Attachment"],
        responses: {
          200: { description: "Attachments fetched successfully" },
        },
      },
    }
  )
  .get(
    "/by-tasks",
    async ({ query, set }) => {
      const taskIds = query.taskIds
        ? Array.isArray(query.taskIds)
          ? query.taskIds
          : query.taskIds.split(",")
        : [];
      const attachments = await AttachmentService.getByTaskIds(taskIds);
      set.status = 200;
      return { attachments };
    },
    {
      auth: true,
      query: GetAttachmentsByTasks.query,
      response: {
        200: GetAttachmentsByTasks.response,
      },
      detail: {
        operationId: "getAttachmentsByTasks",
        tags: ["Attachment"],
        responses: {
          200: { description: "Attachments for multiple tasks" },
        },
      },
    }
  )
  .get(
    "/download/:id",
    async ({ params, set }) => {
      const url = await AttachmentService.getPresignedUrl(params.id);
      if (!url) {
        set.status = 404;
        return { error: "Attachment not found" };
      }
      return Response.redirect(url);
    },
    {
      auth: true,
      params: DownloadAttachment.params,
      response: {
        200: DownloadAttachment.response,
        404: t.Object({ error: t.String() }), // Fallback for error or use Zod if we defined Error schema
      },
      detail: {
        operationId: "getAttachmentsDownloadById",
        tags: ["Attachment"],
        responses: {
          200: { description: "Presigned download URL" },
        },
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      await AttachmentService.delete(params.id);
      set.status = 200;
      return { success: true };
    },
    {
      auth: true,
      params: DeleteAttachment.params,
      response: {
        200: DeleteAttachment.response,
      },
      detail: {
        operationId: "deleteAttachmentsById",
        tags: ["Attachment"],
        responses: {
          200: { description: "Attachment deleted" },
        },
      },
    }
  );
