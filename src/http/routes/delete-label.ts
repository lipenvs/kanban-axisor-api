import Elysia from "elysia";
import z from "zod";
import { db } from "../../database/client";
import { label } from "../../database/schema";
import { eq } from "drizzle-orm";

const params = z.object({
    id: z.string(),
});

export const deleteLabel = new Elysia().delete(
    "/labels/:id",
    async ({ set, params }) => {
        await db.delete(label).where(eq(label.id, params.id));
        set.status = 200;
    },
    {
        params,
        detail: {
            description: "Delete label",
            tags: ["Label"],
            responses: {
                200: {
                    description: "Label deleted successfully",
                },
            },
        },
    }
);
