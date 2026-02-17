import Elysia from "elysia";
import z from "zod";
import { db } from "../../database/client";
import { label } from "../../database/schema";
import { eq } from "drizzle-orm";

const body = z.object({
    name: z.string(),
    color: z.string(),
});

const params = z.object({
    id: z.string(),
});

export const updateLabel = new Elysia().put(
    "/labels/:id",
    async ({ set, params, body }) => {
        await db.update(label).set(body).where(eq(label.id, params.id));
        set.status = 200;
    },
    {
        params,
        body,
        detail: {
            description: "Update a label",
            tags: ["Label"],
            responses: {
                200: {
                    description: "Label updated successfully",
                },
            },
        },
    }
);
