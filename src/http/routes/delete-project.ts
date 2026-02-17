import Elysia from "elysia";
import z from "zod";
import { db } from "../../database/client";
import { project } from "../../database/schema";
import { eq } from "drizzle-orm";

const params = z.object({
    id: z.string(),
});

export const deleteProject = new Elysia().delete(
    "/projects/:id",
    async ({ set, params }) => {
        await db.delete(project).where(eq(project.id, params.id));
        set.status = 200;
    },
    {
        params,
        detail: {
            description: "Delete project",
            tags: ["Project"],
            responses: {
                200: {
                    description: "Project deleted successfully",
                },
            },
        },
    }
);
    