import z from "zod";
import { Elysia } from "elysia";
import { db } from "../../database/client";
import { project } from "../../database/schema";

const createProjectSchema = z.object({
    name: z.string().min(1),
});

export const createProject = new Elysia().post("/projects", async ({ body, set }) => {
    await db.insert(project).values({ name: body.name });
    set.status = 201;
}, {
  body: createProjectSchema,
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