import { Elysia } from "elysia";
import { authPlugin } from "../better-auth";
import { LabelService } from "./service";
import { CreateLabel, GetLabels, UpdateLabel } from "./model";

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
      body: CreateLabel.body,
      response: {
        201: CreateLabel.response,
      },
      detail: {
        operationId: "postLabels",
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
      param: GetLabels.params,
      query: GetLabels.query,
      response: {
        200: GetLabels.response,
      },
      detail: {
        operationId: "getLabelsByProjectId",
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
      params: UpdateLabel.params,
      body: UpdateLabel.body,
      detail: {
        operationId: "putLabelsById",
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
      params: UpdateLabel.params,
      detail: {
        operationId: "deleteLabelsById",
        description: "Delete label",
        tags: ["Label"],
        responses: {
          200: { description: "Label deleted successfully" },
        },
      },
    }
  );
