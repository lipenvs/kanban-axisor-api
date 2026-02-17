import { randomUUIDv7 } from "bun";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user";

export const project = pgTable('project', {
    id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
    name: text('name').notNull(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})