import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { ColumnService } from "./service";
import { CreateColumn, GetColumns, UpdateColumn, SaveColumnPositions, DeleteColumn, GetKanbanBoard } from "./model";

export const columnController = new Elysia({ prefix: "/columns" })
  .use(authPlugin)
  .get(
    "/kanban",
    async ({ query, set }) => {
      const kanban = await ColumnService.getKanbanBoard(query.projectId);
      set.status = 200;
      return kanban;
    },
    {
      auth: true,
      query: GetKanbanBoard.query,
      response: {
        200: GetKanbanBoard.response,
      },
      detail: {
        tags: ["Column"],
        responses: {
          200: { description: "Kanban board fetched successfully" },
        },
      },
    }
  )
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
      const columns = await ColumnService.getAll(query.projectId);
      set.status = 200;
      return { columns };
    },
    {
      auth: true,
      query: GetColumns.query,
      response: {
        200: GetColumns.response,
      },
      detail: {
        tags: ["Column"],
        responses: {
          200: { description: "Columns fetched successfully" },
        },
      },
    }
  )
  .put(
    "/positions",
    async ({ body, set }) => {
      await ColumnService.saveOrder(body.projectId, body.columnIds);
      set.status = 200;
    },
    {
      auth: true,
      body: SaveColumnPositions.body,
      detail: {
        tags: ["Column"],
        responses: {
          200: { description: "Column positions saved successfully" },
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
        tags: ["Column"],
        responses: {
          200: { description: "Column updated successfully" },
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
        tags: ["Column"],
        responses: {
          200: { description: "Column deleted successfully" },
        },
      },
    }
  );
