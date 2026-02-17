import z from "zod";
import { Elysia } from "elysia";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import { betterAuthPlugin } from "../plugins/better-auth";

const body = z.object({
    name: z.string().min(1),
});

const createProjectResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const createProject = new Elysia()
  .use(betterAuthPlugin)
  .post("/projects", async ({ body, set, user }) => {
    const [created] = await db.insert(project).values({
      name: body.name,
      userId: user.id
    }).returning({ id: project.id, name: project.name });
    set.status = 201;
    return created;
}, {
  auth: true,
  body,
  response: {
    201: createProjectResponseSchema,
  },
  detail: {
    description: "Create a new project",
    tags: ["Project"],
    responses: {
      201: {
        description: "Project created successfully",
      },
    },
  },
});