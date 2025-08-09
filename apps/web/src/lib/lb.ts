export type Period = "daily" | "weekly" | "all";

const pad = (n: number, w=2) => n.toString().padStart(w, "0");
function ymd(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  return `${y}${m}${day}`;
}
function isoWeek(d = new Date()) {
  const dd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = dd.getUTCDay() || 7; // Mon=1..Sun=7
  dd.setUTCDate(dd.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((dd.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${dd.getUTCFullYear()}${pad(week)}`; // e.g., 202534
}
export function keyFor(gameId: string, p: Period, now = new Date()) {
  if (p === "all") return `lb:${gameId}:all`;
  if (p === "daily") return `lb:${gameId}:daily:${ymd(now)}`;
  return `lb:${gameId}:weekly:${isoWeek(now)}`;
}
