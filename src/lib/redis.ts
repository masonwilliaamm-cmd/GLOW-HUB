import Redis from "ioredis";

declare global {
  var __redis: Redis | undefined;
}

// Reuse a single connection across hot reloads in dev, same rationale as db.ts.
export const redis =
  global.__redis ?? new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") {
  global.__redis = redis;
}
