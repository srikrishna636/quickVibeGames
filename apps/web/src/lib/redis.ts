// C:\Users\srikr\code\quickvibe\apps\web\src\lib\redis.ts
import { Redis } from "@upstash/redis";

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  return new Redis({ url, token });
}
