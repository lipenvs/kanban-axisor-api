import { Elysia } from "elysia";
import { db } from "../../database/client";
import z from "zod";
import { and, eq, ilike, SQL } from "drizzle-orm";
import { label } from "../../database/schema";

const getLabelsResponseSchema = z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    projectId: z.string(),
}));

const query = z.object({
    search: z.string().optional(),
});

const param = z.object({
    projectId: z.string(),
});

export const getLabels = new Elysia().get(
  "/labels/:projectId",
  async ({ set, query, params }) => {
    const { search } = query;
    const { projectId } = params;

    const conditions: SQL[] = [
      eq(label.projectId, projectId),
    ];

    if(search) {
      conditions.push(ilike(label.name, `%${search}%`));
    }

    const labels = await db.select().from(label).where(and(...conditions));
    
    set.status = 200;
    return { labels };
  },
  {
    response: {
      200: z.object({
        labels: getLabelsResponseSchema,
      }),
    },
    query,
    param,
    detail: {
      description: "Get all labels",
      tags: ["Label"],
      responses: {
        200: {
          description: "Labels fetched successfully",
        },
      },
    },
  }
);