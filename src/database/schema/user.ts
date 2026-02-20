import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { v7 as randomUUIDv7 } from "uuid";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().$defaultFn(() => randomUUIDv7()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});