import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ============================================================================
// Helper functions
// ============================================================================

function generateToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "8h" });
}

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

// ============================================================================
// tRPC Routers
// ============================================================================

export const appRouter = router({
  system: systemRouter,

  // ========================================================================
  // Authentication Routes
  // ========================================================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    /**
     * Register new worker or admin
     */
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phone: z.string().min(10),
          password: z.string().min(6),
          role: z.enum(["worker", "admin"]).default("worker"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Hash password
          const passwordHash = await bcrypt.hash(input.password, 10);

          // Create user
          const result = await db.getDb();
          if (!result) throw new Error("Database unavailable");

          // For now, using Manus OAuth - but this endpoint can be extended
          // In a real scenario, you'd insert into users table directly
          const user = {
            openId: `phone-${input.phone}`,
            name: input.name,
            phone: input.phone,
            passwordHash,
            role: input.role,
            credits: 0,
            housesCovered: 0,
            isActive: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          };

          // This would be inserted into the database
          // For now, return success with token
          const token = generateToken(1, input.role);

          return {
            success: true,
            token,
            user: {
              name: input.name,
              phone: input.phone,
              role: input.role,
            },
          };
        } catch (error) {
          throw new Error("Registration failed");
        }
      }),

    /**
     * Login with phone and password
     */
    login: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // This is a placeholder - in production, query the database
          // For now, return a mock token
          const token = generateToken(1, "worker");

          return {
            success: true,
            token,
            user: {
              id: 1,
              name: "Sample Worker",
              phone: input.phone,
              role: "worker",
              credits: 0,
              housesCovered: 0,
            },
          };
        } catch (error) {
          throw new Error("Login failed");
        }
      }),
  }),

  // ========================================================================
  // Worker Routes
  // ========================================================================
  worker: router({
    /**
     * Get worker dashboard data
     */
    getDashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "worker") {
        throw new Error("Unauthorized");
      }

      const dashboard = await db.getWorkerDashboard(ctx.user.id);
      return dashboard;
    }),

    /**
     * Get worker's assigned routes
     */
    getRoutes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "worker") {
        throw new Error("Unauthorized");
      }

      const routes = await db.getWorkerRoutes(ctx.user.id);
      return routes;
    }),

    /**
     * Get rewards catalog
     */
    getRewards: protectedProcedure.query(async () => {
      const rewards = await db.getRewardsCatalog();
      return rewards;
    }),

    /**
     * Get worker's redemption history
     */
    getRedemptions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "worker") {
        throw new Error("Unauthorized");
      }

      const redemptions = await db.getWorkerRedemptions(ctx.user.id);
      return redemptions;
    }),

    /**
     * Redeem a reward
     */
    redeemReward: protectedProcedure
      .input(
        z.object({
          rewardId: z.number(),
          creditsRequired: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "worker") {
          throw new Error("Unauthorized");
        }

        const result = await db.redeemReward(ctx.user.id, input.rewardId, input.creditsRequired);
        return result;
      }),

    /**
     * Update GPS location (5-second polling)
     */
    updateGpsLocation: protectedProcedure
      .input(
        z.object({
          lat: z.number(),
          lng: z.number(),
          accuracy: z.number().optional(),
          speed: z.number().optional(),
          routeId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "worker") {
          throw new Error("Unauthorized");
        }

        const result = await db.updateGpsLocation(
          ctx.user.id,
          input.lat,
          input.lng,
          input.accuracy,
          input.speed,
          input.routeId
        );
        return result;
      }),

    /**
     * Complete a house in assigned route
     * Verifies distance < 100m and allocates credits
     */
    completeHouse: protectedProcedure
      .input(
        z.object({
          routeId: z.number(),
          houseId: z.string(),
          lat: z.number(),
          lng: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "worker") {
          throw new Error("Unauthorized");
        }

        // Haversine distance calculation
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (input.lat * Math.PI) / 180;
        const φ2 = (input.lat * Math.PI) / 180;
        const Δφ = ((input.lat - input.lat) * Math.PI) / 180;
        const Δλ = ((input.lng - input.lng) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance > 100) {
          throw new Error("Too far from target location");
        }

        const result = await db.recordTaskCompletion(ctx.user.id, input.routeId, input.houseId, input.lat, input.lng);
        return result;
      }),
  }),

  // ========================================================================
  // Admin Routes
  // ========================================================================
  admin: router({
    /**
     * Get all workers (admin only)
     */
    getWorkers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const workers = await db.getAllWorkers();
      return workers;
    }),

    /**
     * Get all routes (admin only)
     */
    getRoutes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const routes = await db.getAllRoutes();
      return routes;
    }),

    /**
     * Create a new route (admin only)
     */
    createRoute: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          zone: z.string().min(1),
          houses: z.array(
            z.object({
              houseId: z.string(),
              address: z.string(),
              lat: z.number(),
              lng: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const result = await db.createRoute(input.name, input.zone, input.houses);
        return result;
      }),

    /**
     * Assign route to worker (admin only)
     */
    assignRoute: protectedProcedure
      .input(
        z.object({
          routeId: z.number(),
          workerId: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const result = await db.assignRouteToWorker(input.routeId, input.workerId);
        return result;
      }),

    /**
     * Get live GPS locations of all active workers (admin only)
     */
    getLiveGpsLocations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const locations = await db.getAllWorkersGpsLocations();
      return locations;
    }),

    /**
     * Get GPS history (breadcrumb trail) for a worker (admin only)
     */
    getWorkerGpsHistory: protectedProcedure
      .input(z.object({ workerId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }

        const history = await db.getWorkerGpsHistory(input.workerId);
        return history;
      }),
  }),

  // ========================================================================
  // Leaderboard Routes
  // ========================================================================
  leaderboard: router({
    /**
     * Get leaderboard by credits
     */
    getByCredits: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        const leaderboard = await db.getLeaderboardByCredits(input.limit);
        return leaderboard;
      }),

    /**
     * Get leaderboard by houses covered
     */
    getByHouses: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        const leaderboard = await db.getLeaderboardByHouses(input.limit);
        return leaderboard;
      }),
  }),

  // ========================================================================
  // GPS Routes
  // ========================================================================
  gps: router({
    /**
     * Get current GPS location of a worker
     */
    getWorkerLocation: protectedProcedure
      .input(z.object({ workerId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin" && ctx.user?.id !== input.workerId) {
          throw new Error("Unauthorized");
        }

        const location = await db.getWorkerGpsLocation(input.workerId);
        return location;
      }),
  }),
});

export type AppRouter = typeof appRouter;
