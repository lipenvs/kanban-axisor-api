import { v7 as randomUUIDv7 } from "uuid";
import { pgTable, text, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { task } from "./task";

export const attachmentStatusEnum = pgEnum('attachment_status', ['pending', 'scanning', 'clean', 'infected', 'error']);

export const attachment = pgTable('attachment', {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  taskId: uuid("task_id").notNull().references(() => task.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  storageKey: text('storage_key').notNull(),
  status: attachmentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
