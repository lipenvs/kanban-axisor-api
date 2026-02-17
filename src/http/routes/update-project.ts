import Elysia from "elysia";
import z from "zod";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import { eq } from "drizzle-orm";

const body = z.object({
    name: z.string(),
});

const params = z.object({
    id: z.string(),
});

export const updateProject = new Elysia().put(
    "/projects/:id",
    async ({ set, params, body }) => {
        await db.update(project).set({ name: body.name }).where(eq(project.id, params.id));
        set.status = 200;
    },
    {
        params,
        body,
        detail: {
            description: "Update a project",
            tags: ["Project"],
            responses: {
                200: {
                    description: "Project updated successfully",
                },
            },
        },
    }
);