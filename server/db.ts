import { eq, desc, and, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, routes, gpsLocations, gpsHistory, taskCompletions, rewards, rewardRedemptions } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// EcoCred-specific queries
// ============================================================================

/**
 * Get worker dashboard data: credits, houses covered, assigned route
 */
export async function getWorkerDashboard(workerId: number) {
  const db = await getDb();
  if (!db) return null;

  const worker = await db.select().from(users).where(eq(users.id, workerId)).limit(1);
  if (!worker.length) return null;

  const user = worker[0];
  
  // Get assigned route if any
  let assignedRoute = null;
  if (user.assignedRouteId) {
    const route = await db.select().from(routes).where(eq(routes.id, user.assignedRouteId)).limit(1);
    if (route.length) {
      assignedRoute = route[0];
    }
  }

  return {
    id: user.id,
    name: user.name,
    credits: user.credits,
    housesCovered: user.housesCovered,
    assignedRoute,
    isActive: user.isActive === 1,
  };
}

/**
 * Get all routes for a worker (assigned routes)
 */
export async function getWorkerRoutes(workerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(routes).where(eq(routes.assignedWorkerId, workerId));
}

/**
 * Get all rewards catalog
 */
export async function getRewardsCatalog() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rewards).where(eq(rewards.isActive, 1));
}

/**
 * Get worker's redemption history
 */
export async function getWorkerRedemptions(workerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(rewardRedemptions).where(eq(rewardRedemptions.workerId, workerId));
}

/**
 * Update GPS location (upsert pattern)
 */
export async function updateGpsLocation(workerId: number, lat: number, lng: number, accuracy?: number, speed?: number, routeId?: number) {
  const db = await getDb();
  if (!db) return null;

  // Upsert into gpsLocations (one record per worker)
  await db.insert(gpsLocations).values([
    {
      workerId,
      lat: String(lat),
      lng: String(lng),
      accuracy: accuracy ? String(accuracy) : undefined,
      speed: speed ? String(speed) : undefined,
      routeId,
      timestamp: new Date(),
    },
  ]).onDuplicateKeyUpdate({
    set: {
      lat: String(lat),
      lng: String(lng),
      accuracy: accuracy ? String(accuracy) : undefined,
      speed: speed ? String(speed) : undefined,
      routeId,
      timestamp: new Date(),
    },
  });

  // Also append to gpsHistory for breadcrumb trail
  await db.insert(gpsHistory).values([
    {
      workerId,
      lat: String(lat),
      lng: String(lng),
      accuracy: accuracy ? String(accuracy) : undefined,
      timestamp: new Date(),
    },
  ]);

  return { lat, lng, timestamp: new Date() };
}

/**
 * Get current GPS location of a worker
 */
export async function getWorkerGpsLocation(workerId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(gpsLocations).where(eq(gpsLocations.workerId, workerId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get all active workers' GPS locations (for admin live map)
 * Only returns workers active in the last 5 minutes
 */
export async function getAllWorkersGpsLocations() {
  const db = await getDb();
  if (!db) return [];

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const result = await db.select({
    workerId: gpsLocations.workerId,
    lat: gpsLocations.lat,
    lng: gpsLocations.lng,
    accuracy: gpsLocations.accuracy,
    speed: gpsLocations.speed,
    timestamp: gpsLocations.timestamp,
    workerName: users.name,
    routeId: gpsLocations.routeId,
  })
    .from(gpsLocations)
    .innerJoin(users, eq(gpsLocations.workerId, users.id))
    .where(gte(gpsLocations.timestamp, fiveMinutesAgo));

  return result;
}

/**
 * Get GPS history (breadcrumb trail) for a worker
 * Returns last 100 points
 */
export async function getWorkerGpsHistory(workerId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(gpsHistory)
    .where(eq(gpsHistory.workerId, workerId))
    .orderBy(desc(gpsHistory.timestamp))
    .limit(limit);
}

/**
 * Record task completion with GPS proof
 */
export async function recordTaskCompletion(workerId: number, routeId: number, houseId: string, gpsLat: number, gpsLng: number, creditsEarned = 10) {
  const db = await getDb();
  if (!db) return null;

  // Insert task completion
  const result = await db.insert(taskCompletions).values([
    {
      workerId,
      routeId,
      houseId,
      creditsEarned,
      gpsProofLat: String(gpsLat),
      gpsProofLng: String(gpsLng),
      completedAt: new Date(),
    },
  ]);

  // Update worker credits and houses covered
  const worker = await db.select().from(users).where(eq(users.id, workerId)).limit(1);
  if (worker.length) {
    const currentUser = worker[0];
    await db.update(users)
      .set({
        credits: (currentUser.credits || 0) + creditsEarned,
        housesCovered: (currentUser.housesCovered || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, workerId));
  }

  return result;
}

/**
 * Get leaderboard: top workers by credits earned
 */
export async function getLeaderboardByCredits(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: users.id,
    name: users.name,
    credits: users.credits,
    housesCovered: users.housesCovered,
    role: users.role,
  })
    .from(users)
    .where(and(eq(users.role, 'worker'), eq(users.isActive, 1)))
    .orderBy(desc(users.credits))
    .limit(limit);
}

/**
 * Get leaderboard: top workers by houses covered
 */
export async function getLeaderboardByHouses(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: users.id,
    name: users.name,
    credits: users.credits,
    housesCovered: users.housesCovered,
    role: users.role,
  })
    .from(users)
    .where(and(eq(users.role, 'worker'), eq(users.isActive, 1)))
    .orderBy(desc(users.housesCovered))
    .limit(limit);
}

/**
 * Get all workers for admin management
 */
export async function getAllWorkers() {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: users.id,
    name: users.name,
    phone: users.phone,
    credits: users.credits,
    housesCovered: users.housesCovered,
    assignedRouteId: users.assignedRouteId,
    isActive: users.isActive,
    createdAt: users.createdAt,
  })
    .from(users)
    .where(eq(users.role, 'worker'))
    .orderBy(desc(users.createdAt));
}

/**
 * Get all routes for admin management
 */
export async function getAllRoutes() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(routes).orderBy(desc(routes.createdAt));
}

/**
 * Create a new route
 */
export async function createRoute(name: string, zone: string, houses: any[]) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(routes).values([
    {
      name,
      zone,
      houses: JSON.stringify(houses),
      status: 'unassigned',
      createdAt: new Date(),
    },
  ]);

  return result;
}

/**
 * Assign route to worker
 */
export async function assignRouteToWorker(routeId: number, workerId: number) {
  const db = await getDb();
  if (!db) return null;

  // Update route
  await db.update(routes)
    .set({
      assignedWorkerId: workerId,
      status: 'active',
    })
    .where(eq(routes.id, routeId));

  // Update worker
  await db.update(users)
    .set({
      assignedRouteId: routeId,
      updatedAt: new Date(),
    })
    .where(eq(users.id, workerId));

  return { routeId, workerId };
}

/**
 * Redeem reward for worker
 */
export async function redeemReward(workerId: number, rewardId: number, creditsRequired: number) {
  const db = await getDb();
  if (!db) return null;

  // Get worker
  const worker = await db.select().from(users).where(eq(users.id, workerId)).limit(1);
  if (!worker.length || worker[0].credits < creditsRequired) {
    throw new Error("Insufficient credits");
  }

  // Record redemption
  await db.insert(rewardRedemptions).values([
    {
      workerId,
      rewardId,
      creditsSpent: creditsRequired,
      redeemedAt: new Date(),
    },
  ]);

  // Deduct credits
  await db.update(users)
    .set({
      credits: worker[0].credits - creditsRequired,
      updatedAt: new Date(),
    })
    .where(eq(users.id, workerId));

  return { success: true };
}
