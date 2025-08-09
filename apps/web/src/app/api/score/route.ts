import { cookies } from "next/headers";
import { getRedis } from "@/lib/redis";
import { keyFor, type Period } from "@/lib/lb";

type Body = { gameId: string; score: number; durationMs?: number };

export async function POST(req: Request) {
  const { gameId, score, durationMs }: Body = await req.json();
  if (!gameId || typeof score !== "number" || !Number.isFinite(score)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), { status: 400 });
  }

  // Minimal anti-abuse for our sample game: expected 10s ± 1s
  if (durationMs && (durationMs < 9000 || durationMs > 11000)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid duration" }), { status: 400 });
  }

  const store = await cookies();
  const player = store.get("qid")?.value;
  if (!player) {
    return new Response(JSON.stringify({ ok: false, error: "No guest id" }), { status: 401 });
  }

  const redis = getRedis();
  const periods: Period[] = ["daily", "weekly", "all"];

  for (const p of periods) {
    const key = keyFor(gameId, p);
    // keep the player's BEST score (higher is better)
    const prev = await redis.zscore(key, player); // <- no generic
    if (prev == null || score > Number(prev)) {
      await redis.zadd(key, { score, member: player });
    }
  }
  return Response.json({ ok: true });
}
