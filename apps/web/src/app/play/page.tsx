"use client";
import { useEffect, useRef, useState } from "react";

const GAME_ID = "tapper-v1";

export default function Play() {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const startMs = useRef<number | null>(null);

  useEffect(() => {
    // ensure guest id cookie exists
    fetch("/api/guest").then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t0 = performance.now();
    startMs.current = t0;
    setTimeLeft(10);
    const iv = setInterval(() => {
      const elapsed = Math.floor((performance.now() - t0) / 1000);
      setTimeLeft(Math.max(0, 10 - elapsed));
      if (elapsed >= 10) {
        clearInterval(iv);
        setPlaying(false);
        submitScore();
      }
    }, 200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  async function submitScore() {
    const end = performance.now();
    const durationMs = startMs.current ? end - startMs.current : 10000;
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId: GAME_ID, score: clicks, durationMs }),
    });
    if (res.ok) {
      // refresh leaderboard panel
      await fetchLeaderboard();
    }
  }

  async function fetchLeaderboard() {
    const res = await fetch(`/api/leaderboard?game=${GAME_ID}&period=daily&limit=10`, { cache: "no-store" });
    const data = await res.json();
    const el = document.getElementById("lb");
    if (el) el.textContent = JSON.stringify(data.data ?? [], null, 2);
  }

  useEffect(() => { fetchLeaderboard(); }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Tapper — 10s click challenge</h1>
        <p className="text-white/70">Click the big button as many times as you can in 10 seconds.</p>

        <div className="rounded-2xl p-6 border border-white/10 bg-white/5">
          <div className="text-sm text-white/60 mb-2">Time left: <span className="font-mono">{timeLeft}s</span></div>

          <button
            disabled={!ready || playing}
            onClick={() => { setClicks(0); setPlaying(true); }}
            className="rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-mint to-aqua text-ink shadow-[var(--shadow-neon)] disabled:opacity-50"
          >
            {playing ? "Playing..." : "Start"}
          </button>

          <div className="mt-6">
            <button
              onClick={() => playing && setClicks(c => c + 1)}
              disabled={!playing}
              className="w-full h-40 rounded-2xl border-2 border-white/15 bg-white/5 text-3xl font-black"
              aria-label="Tap"
            >
              {clicks}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Daily leaderboard</h2>
        <pre id="lb" className="text-xs whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10" />
      </section>
    </div>
  );
}
