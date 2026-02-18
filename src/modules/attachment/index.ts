import { Elysia, t } from "elysia";
import { authPlugin } from "../better-auth";
import { AttachmentService } from "./service";

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
      params: t.Object({ taskId: t.String({ format: "uuid" }) }),
      body: t.Object({ file: t.File() }),
      detail: {
        tags: ["Attachment"],
        responses: {
          201: { description: "File uploaded and queued for processing" },
        },
      },
    }
  )
  .get(
    "/:taskId",
    async ({ params }) => {
      const attachments = await AttachmentService.getByTaskId(params.taskId);
      return { attachments };
    },
    {
      auth: true,
      params: t.Object({ taskId: t.String({ format: "uuid" }) }),
      detail: {
        tags: ["Attachment"],
        responses: {
          200: { description: "Attachments fetched successfully" },
        },
      },
    }
  )
  .get(
    "/by-tasks",
    async ({ query }) => {
      const taskIds = query.taskIds ? query.taskIds.split(",") : [];
      const attachments = await AttachmentService.getByTaskIds(taskIds);
      return { attachments };
    },
    {
      auth: true,
      query: t.Object({ taskIds: t.Optional(t.String()) }),
      detail: {
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
      return { url };
    },
    {
      auth: true,
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      detail: {
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
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      detail: {
        tags: ["Attachment"],
        responses: {
          200: { description: "Attachment deleted" },
        },
      },
    }
  );
