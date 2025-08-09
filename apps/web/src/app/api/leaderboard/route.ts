import { getRedis } from "@/src/lib/redis";
import { keyFor, type Period } from "@/src/lib/lb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameId = url.searchParams.get("game") ?? "tapper-v1";
  const period = (url.searchParams.get("period") ?? "daily") as Period;
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "10", 10), 50);

  const redis = getRedis();
  const key = keyFor(gameId, period);
  // top N, high → low
  const rows = await redis.zrange<{ member: string; score: number }>(key, 0, limit - 1, {
    rev: true,
    withScores: true,
  });

  const data = rows.map((r, i) => ({ rank: i + 1, userId: r.member, score: r.score }));
  return Response.json({ ok: true, gameId, period, data });
}
