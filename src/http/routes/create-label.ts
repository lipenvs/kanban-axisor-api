import z from "zod";
import { Elysia } from "elysia";
import { db } from "../../database/client";
import { betterAuthPlugin } from "../plugins/better-auth";
import { label } from "../../database/schema";

const body = z.object({
    name: z.string().min(1),
    color: z.string().min(1),
    projectId: z.uuid(),
});

const createLabelResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
});

export const createLabel = new Elysia()
  .use(betterAuthPlugin)
  .post("/labels", async ({ body, set }) => {
    const [created] = await db.insert(label).values({
      name: body.name,
      color: body.color,
      projectId: body.projectId,
    }).returning({ id: label.id, name: label.name, color: label.color });
    set.status = 201;
    return created;
}, {
  auth: true,
  body,
  response: {
    201: createLabelResponseSchema,
  },
  detail: {
    description: "Create a new label",
    tags: ["Label"],
    responses: {
      201: {
        description: "Label created successfully",
      },
    },
  },
});