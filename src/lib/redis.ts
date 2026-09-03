import Redis from "ioredis";

declare global {
  var __redis: Redis | undefined;
}

// Reuse a single connection across hot reloads in dev, same rationale as db.ts.
export const redis =
  global.__redis ?? new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");

// ioredis connects eagerly on instantiation and emits 'error' on the
// instance for connection failures; without a listener, Node treats that
// as an unhandled error and crashes the process. A misconfigured/missing
// REDIS_URL should degrade (session-dependent routes fail) rather than
// take the whole app down.
redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
});

if (process.env.NODE_ENV !== "production") {
  global.__redis = redis;
}
