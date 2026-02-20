import { v7 as randomUUIDv7 } from "uuid";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { project } from "./project";

export const column = pgTable('column', {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  title: text('title').notNull(),
  order: text('order').notNull(),
  projectId: uuid("project_id").notNull().references(() => project.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
