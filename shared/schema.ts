import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repository: text("repository").notNull(),
  eventType: text("event_type").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  filesAnalyzed: jsonb("files_analyzed").notNull(),
  status: text("status").notNull(),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  timestamp: true,
});

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
