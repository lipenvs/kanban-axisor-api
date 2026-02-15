import { user } from "./user";
import { pgTable, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { randomUUIDv7 } from "bun";

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);