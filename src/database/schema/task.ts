import { randomUUIDv7 } from "bun";
import { pgTable, text, uuid, timestamp, bigint } from "drizzle-orm/pg-core";
import { column } from "./column";
import { label } from "./label";

export const task = pgTable('task', {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  title: text('title').notNull(),
  order: bigint('order', { mode: 'number' }).notNull().default(10000),
  columnId: uuid("column_id").notNull().references(() => column.id, { onDelete: 'cascade' }),
  labelId: uuid("label_id").references(() => label.id, { onDelete: 'set null' }),
  description: text('description'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
