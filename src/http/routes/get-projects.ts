import { Elysia } from "elysia";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import z from "zod";
import { and, ilike, SQL } from "drizzle-orm";

const getProjectsResponseSchema = z.array(z.object({
    id: z.string(),
    name: z.string(),
}));

const query = z.object({
    search: z.string().optional(),
});

export const getProjects = new Elysia().get(
  "/projects",
  async ({ set, query }) => {
    const { search } = query;

    const conditions: SQL[] = [];

    if(search) {
      conditions.push(ilike(project.name, `%${search}%`));
    }

    const projects = await db.select().from(project).where(and(...conditions));
    
    set.status = 200;
    return { projects };
  },
  {
    response: {
      200: z.object({
        projects: getProjectsResponseSchema,
      }),
    },
    query,
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