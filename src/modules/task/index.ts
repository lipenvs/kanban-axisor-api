import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { TaskService } from "./service";
import { CreateTask, UpdateTask, DeleteTask, ReorderTasks } from "./model";

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
  .patch(
    "/reorder",
    async ({ body, set }) => {
      await TaskService.reorder(body.tasks);
      set.status = 200;
    },
    {
      auth: true,
      body: ReorderTasks.body,
      detail: {
        operationId: "patchTasksReorder",
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
