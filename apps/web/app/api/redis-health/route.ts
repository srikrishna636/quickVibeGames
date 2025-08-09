import { Redis } from "@upstash/redis";

export async function GET() {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL as string | undefined;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN as string | undefined;
    if (!url || !token) {
      return new Response(JSON.stringify({ ok: false, error: "Missing Upstash env vars" }), { status: 500 });
    }

    const redis = new Redis({ url, token });
    const pong = await redis.ping();
    return Response.json({ ok: true, pong });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  }
}
