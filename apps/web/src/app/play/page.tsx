"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listGames } from "@qv/shared";

type SelectOption = { label: string; value: string };

function normalizeCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export default function HomePage() {
  const router = useRouter();

  // Read games from the shared registry
  const games = useMemo(() => listGames(), []);
  // Default to first game if present (falls back to "duo")
  const defaultSlug = games[0]?.slug ?? "duo";

  // Quick start controls
  const [slug, setSlug] = useState<string>(defaultSlug);
  const [code, setCode] = useState<string>("");

  const gameOptions: SelectOption[] = games.map((g) => ({ label: g.title, value: g.slug }));

  function onQuickStart() {
    router.push(`/play/${encodeURIComponent(slug)}?quick=1`);
  }

  function onJoinByCode() {
    const c = normalizeCode(code);
    if (!c || c.length < 4) return alert("Enter a code with at least 4 characters (A–Z / 2–9).");
    router.push(`/play/${encodeURIComponent(slug)}?code=${encodeURIComponent(c)}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-[#0a0f18] text-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Multiplayer & Solo · Fast · No login required
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            QuickVibe <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua to-mint">Games</span>
          </h1>
          <p className="max-w-2xl text-white/70">
            A snappy web arcade. Create a friend code, share a link, and play in seconds—no installs, no signup.
          </p>

          {/* Quick Actions */}
          <div className="mt-2 grid w-full gap-3 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <select
                className="w-full sm:w-56 rounded-2xl bg-white/5 border border-white/10 px-4 py-2 outline-none"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                aria-label="Choose game"
              >
                {gameOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <div className="flex items-stretch gap-2 w-full">
                <input
                  className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-2 font-mono outline-none"
                  placeholder="Enter friend code (e.g., AB12)"
                  maxLength={8}
                  value={code}
                  onChange={(e) => setCode(normalizeCode(e.target.value))}
                  aria-label="Friend code"
                />
                <button
                  onClick={onJoinByCode}
                  className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
                  title="Join a friend match with this code"
                >
                  Join
                </button>
              </div>
            </div>

            <button
              onClick={onQuickStart}
              className="rounded-2xl px-5 py-3 bg-gradient-to-r from-aqua to-mint text-ink font-semibold hover:opacity-90"
              title="Start a quickmatch now"
            >
              Play Now
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm mt-1">
            <Link href="/quickmatch" className="text-white/80 hover:text-white underline underline-offset-4">
              Use full quickmatch page
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/play" className="text-white/80 hover:text-white underline underline-offset-4">
              Browse all games
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard title="Instant Play" body="Tap a link and go. Friend codes for private matches, quickmatch for fast games." />
          <FeatureCard title="Realtime Multiplayer" body="Colyseus WebSockets on Fly.io keeps matches smooth and low-latency." />
          <FeatureCard title="Fair Leaderboards" body="Daily, weekly, and all-time scores stored in Upstash Redis." />
        </div>
      </section>

      {/* Games Grid */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Games</h2>
          <Link href="/play" className="text-white/80 hover:text-white underline underline-offset-4">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.slug} slug={g.slug} title={g.title} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-white/50 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} QuickVibe.Games</div>
          <div className="flex items-center gap-4">
            <Link href="/api/redis-health" className="hover:text-white">Redis Health</Link>
            <Link href="/api/db-health" className="hover:text-white">DB Health</Link>
            <a href="https://quickvibe-rt-srikrishna.fly.dev/" className="hover:text-white" target="_blank" rel="noreferrer">RT Health</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard(props: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-lg font-semibold mb-1">{props.title}</div>
      <div className="text-white/70 text-sm">{props.body}</div>
    </div>
  );
}

function GameCard(props: { slug: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 flex flex-col gap-3">
      <div className="text-lg font-semibold">{props.title}</div>
      <div className="text-white/60 text-sm">Play with a friend or jump into a quickmatch.</div>
      <div className="mt-auto flex items-center gap-2">
        <Link
          href={`/play/${props.slug}?quick=1`}
          className="rounded-xl px-3 py-2 bg-gradient-to-r from-aqua to-mint text-ink font-semibold hover:opacity-90"
        >
          Quickmatch
        </Link>
        <Link
          href={`/quickmatch`}
          className="rounded-xl px-3 py-2 border border-white/15 hover:bg-white/5"
        >
          Friend Code
        </Link>
      </div>
    </div>
  );
}
