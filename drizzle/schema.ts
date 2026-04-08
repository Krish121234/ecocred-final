import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended for EcoCred: workers and admins earn credits and track routes.
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
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "worker"]).default("user").notNull(),
  // EcoCred specific fields
  credits: int("credits").default(0).notNull(),
  housesCovered: int("housesCovered").default(0).notNull(),
  assignedRouteId: int("assignedRouteId"),
  isActive: int("isActive").default(1).notNull(), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Routes table: Represents garbage collection routes assigned to workers.
 * Each route contains multiple houses with GPS coordinates.
 */
export const routes = mysqlTable("routes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  zone: varchar("zone", { length: 255 }).notNull(),
  houses: json("houses").notNull(), // JSON array of { houseId, address, lat, lng, completed }
  assignedWorkerId: int("assignedWorkerId"),
  status: mysqlEnum("status", ["unassigned", "active", "completed"]).default("unassigned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

/**
 * GPS Locations table: Tracks real-time worker positions.
 * Upserted on each location update (one record per worker).
 */
export const gpsLocations = mysqlTable("gpsLocations", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull().unique(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  speed: decimal("speed", { precision: 8, scale: 2 }),
  routeId: int("routeId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type GpsLocation = typeof gpsLocations.$inferSelect;
export type InsertGpsLocation = typeof gpsLocations.$inferInsert;

/**
 * GPS History table: Stores breadcrumb trail of worker movements.
 * Allows admins to see movement history and verify route completion.
 */
export const gpsHistory = mysqlTable("gpsHistory", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type GpsHistoryRecord = typeof gpsHistory.$inferSelect;
export type InsertGpsHistoryRecord = typeof gpsHistory.$inferInsert;

/**
 * Task Completions table: Records when a worker completes a house with GPS proof.
 * Stores credits earned and GPS coordinates as proof of location.
 */
export const taskCompletions = mysqlTable("taskCompletions", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  routeId: int("routeId").notNull(),
  houseId: varchar("houseId", { length: 255 }).notNull(),
  creditsEarned: int("creditsEarned").default(10).notNull(),
  gpsProofLat: decimal("gpsProofLat", { precision: 10, scale: 8 }).notNull(),
  gpsProofLng: decimal("gpsProofLng", { precision: 11, scale: 8 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof taskCompletions.$inferInsert;

/**
 * Rewards table: Catalog of rewards workers can redeem with credits.
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creditsRequired: int("creditsRequired").notNull(),
  icon: varchar("icon", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Reward Redemptions table: Tracks when workers redeem rewards.
 */
export const rewardRedemptions = mysqlTable("rewardRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  workerId: int("workerId").notNull(),
  rewardId: int("rewardId").notNull(),
  creditsSpent: int("creditsSpent").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});

export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;