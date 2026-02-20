import { randomUUIDv7 } from "bun";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { project } from "./project";

export const label = pgTable('label', {
    id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
    name: text('name').notNull(),
    color: text('color').notNull(),
    projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
