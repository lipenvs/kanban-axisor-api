import z from "zod";
import { Elysia } from "elysia";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import { betterAuthPlugin } from "../plugins/better-auth";

const createProjectSchema = z.object({
    name: z.string().min(1),
});

export const createProject = new Elysia()
  .use(betterAuthPlugin)
  .post("/projects", async ({ body, set, user }) => {
    await db.insert(project).values({ 
      name: body.name,
      userId: user.id 
    });
    set.status = 201;
}, {
  auth: true,
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