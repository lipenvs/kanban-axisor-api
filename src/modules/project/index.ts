import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { ProjectService } from "./service";
import { CreateProject, GetProjects, UpdateProject, DeleteProject } from "./model";

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
      body: CreateProject.body,
      response: {
        201: CreateProject.response,
      },
      detail: {
        operationId: "postProjects",
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
      query: GetProjects.query,
      response: {
        200: GetProjects.response,
      },
      detail: {
        operationId: "getProjects",
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
      params: UpdateProject.params,
      body: UpdateProject.body,
      detail: {
        operationId: "putProjectsById",
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
      params: DeleteProject.params,
      detail: {
        operationId: "deleteProjectsById",
        description: "Delete project",
        tags: ["Project"],
        responses: {
          200: { description: "Project deleted successfully" },
        },
      },
    }
  );
