import { Elysia } from "elysia";
import { authPlugin } from "../auth";
import { ProjectService } from "./service";
import { ProjectModel } from "./model";

export const projectController = new Elysia({ prefix: "/projects" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, set, user }) => {
      const created = await ProjectService.create(body.name, user.id);
      set.status = 201;
      return created;
    },
    {
      auth: true,
      body: ProjectModel.createBody,
      response: {
        201: ProjectModel.createResponse,
      },
      detail: {
        description: "Create a new project",
        tags: ["Project"],
        responses: {
          201: { description: "Project created successfully" },
        },
      },
    }
  )
  .get(
    "/",
    async ({ set, query }) => {
      const projects = await ProjectService.getAll(query.search);
      set.status = 200;
      return { projects };
    },
    {
      query: ProjectModel.getQuery,
      response: {
        200: ProjectModel.getResponse,
      },
      detail: {
        description: "Get all projects",
        tags: ["Project"],
        responses: {
          200: { description: "Projects fetched successfully" },
        },
      },
    }
  )
  .put(
    "/:id",
    async ({ set, params, body }) => {
      await ProjectService.update(params.id, body.name);
      set.status = 200;
    },
    {
      params: ProjectModel.params,
      body: ProjectModel.updateBody,
      detail: {
        description: "Update a project",
        tags: ["Project"],
        responses: {
          200: { description: "Project updated successfully" },
        },
      },
    }
  )
  .delete(
    "/:id",
    async ({ set, params }) => {
      await ProjectService.delete(params.id);
      set.status = 200;
    },
    {
      params: ProjectModel.params,
      detail: {
        description: "Delete project",
        tags: ["Project"],
        responses: {
          200: { description: "Project deleted successfully" },
        },
      },
    }
  );
