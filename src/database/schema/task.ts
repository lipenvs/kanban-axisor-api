import { randomUUIDv7 } from "bun";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { column } from "./column";
import { label } from "./label";
import { user } from "./user";

export const task = pgTable('task', {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  title: text('title').notNull(),
  order: text('order').notNull(),
  columnId: uuid("column_id").notNull().references(() => column.id, { onDelete: 'cascade' }),
  labelId: uuid("label_id").references(() => label.id, { onDelete: 'set null' }),
  assigneeId: uuid("assignee_id").references(() => user.id, { onDelete: 'set null' }),
  description: text('description'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
