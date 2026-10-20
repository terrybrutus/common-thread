import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const generations = sqliteTable("generations", {
  id: text("id").primaryKey(),
  day: text("day").notNull(),
  user: text("user").notNull(),
  createdAt: integer("created_at").notNull(),
});
