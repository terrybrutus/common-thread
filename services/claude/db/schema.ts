import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
export const generations = sqliteTable("generations", {
  id: text("id").primaryKey(),
  day: text("day").notNull(),
  user: text("user").notNull(),
  createdAt: integer("created_at").notNull(),
});
export const stories = sqliteTable("stories", {
  owner: text("owner").notNull(),
  id: text("id").notNull(),
  name: text("name").notNull(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, table => [primaryKey({ columns: [table.owner, table.id] })]);
export const accounts = sqliteTable("accounts", {
  owner: text("owner").primaryKey(),
  email: text("email").notNull(),
  showEmail: integer("show_email").notNull(),
  firstSeen: integer("first_seen").notNull(),
  lastSeen: integer("last_seen").notNull(),
  deletedAt: integer("deleted_at").notNull().default(0),
});
export const topics = sqliteTable("topics", {
  owner: text("owner").notNull(), id: text("id").notNull(),
  title: text("title").notNull(), data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, table => [primaryKey({ columns: [table.owner, table.id] })]);
