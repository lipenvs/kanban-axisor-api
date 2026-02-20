import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { ColumnService } from "./service";
import { CreateColumn, UpdateColumn, DeleteColumn, GetColumnsWithTasks, ReorderColumns } from "./model";

export const columnController = new Elysia({ prefix: "/columns" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, set }) => {
      const created = await ColumnService.create(body.title, body.projectId);
      set.status = 201;
      return created;
    },
    {
      auth: true,
      body: CreateColumn.body,
      response: {
        201: CreateColumn.response,
      },
      detail: {
        operationId: "postColumns",
        tags: ["Column"],
        responses: {
          201: { description: "Column created successfully" },
        },
      },
    }
  )
  .get(
    "/",
    async ({ query, set }) => {
      const kanban = await ColumnService.getColumnsWithTasks(query.projectId);
      set.status = 200;
      return kanban;
    },
    {
      auth: true,
      query: GetColumnsWithTasks.query,
      response: {
        200: GetColumnsWithTasks.response,
      },
      detail: {
        operationId: "getColumnsWithTasks",
        tags: ["Column"],
        responses: {
          200: { description: "Kanban board fetched successfully" },
        },
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updated = await ColumnService.update(params.id, body);
      set.status = 200;
      return updated;
    },
    {
      auth: true,
      params: UpdateColumn.params,
      body: UpdateColumn.body,
      response: {
        200: UpdateColumn.response,
      },
      detail: {
        operationId: "putColumnsById",
        tags: ["Column"],
        responses: {
          200: { description: "Column updated successfully" },
        },
      },
    }
  )
  .patch(
  "/reorder",
  async ({ body, set }) => {
    await ColumnService.reorder(body.columns);
    set.status = 200;
  },
  {
    auth: true,
    body: ReorderColumns.body,
    detail: {
      operationId: "patchColumnsReorder",
      tags: ["Column"],
      responses: {
        200: { description: "Columns reordered successfully" },
      },
    },
  }
)
  .delete(
    "/:id",
    async ({ params, set }) => {
      await ColumnService.delete(params.id);
      set.status = 200;
    },
    {
      auth: true,
      params: DeleteColumn.params,
      detail: {
        operationId: "deleteColumnsById",
        tags: ["Column"],
        responses: {
          200: { description: "Column deleted successfully" },
        },
      },
    }
  );
