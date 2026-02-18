import { Elysia } from "elysia";
import { authPlugin } from "../auth";
import { LabelService } from "./service";
import { LabelModel } from "./model";

export const labelController = new Elysia({ prefix: "/labels" })
  .use(authPlugin)
  .post(
    "/",
    async ({ body, set }) => {
      const created = await LabelService.create(body.name, body.color, body.projectId);
      set.status = 201;
      return created;
    },
    {
      auth: true,
      body: LabelModel.createBody,
      response: {
        201: LabelModel.createResponse,
      },
      detail: {
        description: "Create a new label",
        tags: ["Label"],
        responses: {
          201: { description: "Label created successfully" },
        },
      },
    }
  )
  .get(
    "/:projectId",
    async ({ set, query, params }) => {
      const labels = await LabelService.getByProject(params.projectId, query.search);
      set.status = 200;
      return { labels };
    },
    {
      param: LabelModel.getParam,
      query: LabelModel.getQuery,
      response: {
        200: LabelModel.getResponse,
      },
      detail: {
        description: "Get all labels",
        tags: ["Label"],
        responses: {
          200: { description: "Labels fetched successfully" },
        },
      },
    }
  )
  .put(
    "/:id",
    async ({ set, params, body }) => {
      await LabelService.update(params.id, body);
      set.status = 200;
    },
    {
      params: LabelModel.params,
      body: LabelModel.updateBody,
      detail: {
        description: "Update a label",
        tags: ["Label"],
        responses: {
          200: { description: "Label updated successfully" },
        },
      },
    }
  )
  .delete(
    "/:id",
    async ({ set, params }) => {
      await LabelService.delete(params.id);
      set.status = 200;
    },
    {
      params: LabelModel.params,
      detail: {
        description: "Delete label",
        tags: ["Label"],
        responses: {
          200: { description: "Label deleted successfully" },
        },
      },
    }
  );
