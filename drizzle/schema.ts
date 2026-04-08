import { decimal, integer, json, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "worker"]);
export const routeStatusEnum = pgEnum("route_status", ["unassigned", "active", "completed"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  credits: integer("credits").default(0).notNull(),
  housesCovered: integer("housesCovered").default(0).notNull(),
  assignedRouteId: integer("assignedRouteId"),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  zone: varchar("zone", { length: 255 }).notNull(),
  houses: json("houses").notNull(),
  assignedWorkerId: integer("assignedWorkerId"),
  status: routeStatusEnum("status").default("unassigned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Route = typeof routes.$inferSelect;
export type InsertRoute = typeof routes.$inferInsert;

export const gpsLocations = pgTable("gpsLocations", {
  id: serial("id").primaryKey(),
  workerId: integer("workerId").notNull().unique(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  speed: decimal("speed", { precision: 8, scale: 2 }),
  routeId: integer("routeId"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type GpsLocation = typeof gpsLocations.$inferSelect;
export type InsertGpsLocation = typeof gpsLocations.$inferInsert;

export const gpsHistory = pgTable("gpsHistory", {
  id: serial("id").primaryKey(),
  workerId: integer("workerId").notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  accuracy: decimal("accuracy", { precision: 8, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type GpsHistoryRecord = typeof gpsHistory.$inferSelect;
export type InsertGpsHistoryRecord = typeof gpsHistory.$inferInsert;

export const taskCompletions = pgTable("taskCompletions", {
  id: serial("id").primaryKey(),
  workerId: integer("workerId").notNull(),
  routeId: integer("routeId").notNull(),
  houseId: varchar("houseId", { length: 255 }).notNull(),
  creditsEarned: integer("creditsEarned").default(10).notNull(),
  gpsProofLat: decimal("gpsProofLat", { precision: 10, scale: 8 }).notNull(),
  gpsProofLng: decimal("gpsProofLng", { precision: 11, scale: 8 }).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = typeof taskCompletions.$inferInsert;

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creditsRequired: integer("creditsRequired").notNull(),
  icon: varchar("icon", { length: 255 }),
  isActive: integer("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

export const rewardRedemptions = pgTable("rewardRedemptions", {
  id: serial("id").primaryKey(),
  workerId: integer("workerId").notNull(),
  rewardId: integer("rewardId").notNull(),
  creditsSpent: integer("creditsSpent").notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});

export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;