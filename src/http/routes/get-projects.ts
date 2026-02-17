import { Elysia } from "elysia";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import z from "zod";

const getProjectsResponseSchema = z.array(z.object({
    id: z.string(),
    name: z.string(),
}));

export const getProjects = new Elysia().get(
  "/projects",
  async ({ set }) => {
    set.status = 200;
    return db.select().from(project);
  },
  {
    response: {
      200: getProjectsResponseSchema,
    },
    detail: {
      description: "Get all projects",
      tags: ["Project"],
      responses: {
        200: {
          description: "Projects fetched successfully",
        },
      },
    },
  }
);