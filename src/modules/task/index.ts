import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { TaskService } from "./service";
import { CreateTask, GetTasks, UpdateTask, ReorderTask, DeleteTask } from "./model";

export const taskController = new Elysia({ prefix: "/tasks" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, set }) => {
      const created = await TaskService.create(body);
      set.status = 201;
      return created;
    },
    {
      auth: true,
      body: CreateTask.body,
      response: {
        201: CreateTask.response,
      },
      detail: {
        operationId: "postTasks",
        tags: ["Task"],
        responses: {
          201: { description: "Task created successfully" },
        },
      },
    }
  )
  .get(
    "/",
    async ({ query, set }) => {
      const tasks = await TaskService.getAllByProjectId(query.projectId);
      set.status = 200;
      return { tasks };
    },
    {
      auth: true,
      query: GetTasks.query,
      response: {
        200: GetTasks.response,
      },
      detail: {
        operationId: "getTasks",
        tags: ["Task"],
        responses: {
          200: { description: "Tasks fetched successfully" },
        },
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const updated = await TaskService.update(params.id, body);
      set.status = 200;
      return updated;
    },
    {
      auth: true,
      params: UpdateTask.params,
      body: UpdateTask.body,
      response: {
        200: UpdateTask.response,
      },
      detail: {
        operationId: "putTasksById",
        tags: ["Task"],
        responses: {
          200: { description: "Task updated successfully" },
        },
      },
    }
  )
  .post(
    "/reorder",
    async ({ body, set }) => {
      await TaskService.reorder(body.activeId, body.overId!, body.columnId);
      set.status = 200;
    },
    {
      auth: true,
      body: ReorderTask.body,
      detail: {
        operationId: "postTasksReorder",
        tags: ["Task"],
        responses: {
          200: { description: "Tasks reordered successfully" },
        },
      },
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      await TaskService.delete(params.id);
      set.status = 200;
    },
    {
      auth: true,
      params: DeleteTask.params,
      detail: {
        operationId: "deleteTasksById",
        tags: ["Task"],
        responses: {
          200: { description: "Task deleted successfully" },
        },
      },
    }
  );
