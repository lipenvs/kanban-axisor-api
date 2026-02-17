import { randomUUIDv7 } from "bun";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const project = pgTable('project', {
    id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})