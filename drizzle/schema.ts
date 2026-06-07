import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Anonymized scam check usage log.
 * Stores ONLY the outcome (risk_level) and the time of the check.
 * No message text, brand name, sender info, or any user-entered content is stored.
 */
export const scamCheckLogs = mysqlTable("scam_check_logs", {
  id: int("id").autoincrement().primaryKey(),
  riskLevel: mysqlEnum("riskLevel", ["HIGH RISK", "CAUTION", "LOW RISK SIGNALS"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScamCheckLog = typeof scamCheckLogs.$inferSelect;
export type InsertScamCheckLog = typeof scamCheckLogs.$inferInsert;