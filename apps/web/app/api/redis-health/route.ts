import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const pong = await redis.ping();
    return Response.json({ ok: true, pong });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  }
}