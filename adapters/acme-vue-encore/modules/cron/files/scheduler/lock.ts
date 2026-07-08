import { claimByPostgres } from "./store";

// The tiered distributed lock (spec 009 FR-003). tryAcquire returns true if THIS
// caller should fire the job now:
//   - small scale (postgres-only, default): the Postgres atomic claim is the lock;
//   - large scale (REDIS_URL set): a Redis SET NX lock guards the fire window
//     across replicas, avoiding row-level contention on the schedule table.
// The backend is auto-detected by REDIS_URL, mirroring the data-redis opt-in idiom.

// ioredis is loaded lazily and only on the REDIS_URL branch, so the small tier
// pulls no Redis dependency at runtime (FR-003, AC-4).
let redisClient: unknown = null;

async function getRedis(): Promise<{
  set(key: string, val: string, mode1: string, ttl: number, mode2: string): Promise<string | null>;
}> {
  if (redisClient) return redisClient as never;
  const mod = await import("ioredis");
  const Redis = (mod as { default: new (url: string) => unknown }).default;
  redisClient = new Redis(process.env.REDIS_URL as string);
  return redisClient as never;
}

async function acquireRedis(id: string, ttlMs: number): Promise<boolean> {
  const redis = await getRedis();
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const res = await redis.set(`cron:lock:${id}`, token, "PX", ttlMs, "NX");
  return res === "OK";
}

export async function tryAcquire(id: string, ttlMs: number): Promise<boolean> {
  if (process.env.REDIS_URL) {
    return acquireRedis(id, ttlMs);
  }
  return claimByPostgres(id);
}
