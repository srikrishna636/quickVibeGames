import Link from "next/link";
import Image from "next/image";
// If you created the shared package, keep this import.
// Otherwise, you can hardcode the list for now.
import { games } from "@qv/shared/games"; // transpiled via next.config.ts

export default function Home() {
  // Fallback if the shared package isn't wired yet (optional)
  const fallbackGames = [
    {
      slug: "duo",
      title: "Quickmatch Duo",
      blurb: "2-player quickmatch with code or invite link.",
      href: "/play/duo",
      cta: "Open",
      soon: false,
    },
    // Add future games here…
  ];

  const list = games?.length ? games : fallbackGames;

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              QuickVibe<span className="text-cyan-400">.games</span>
            </h1>
            <p className="mt-4 text-zinc-300">
              Tiny, fast multiplayer games you can play in a minute. No login.
              Share a code or a link and you’re in.
            </p>

            {/* Quick start buttons – use Link, not <a> */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/play/duo?quick=1"
                className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400"
              >
                Play now (2-player)
              </Link>
              <Link
                href="/quickmatch"
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-100 hover:border-zinc-600"
              >
                Create / Join with code
              </Link>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              Tip: share the link from the quickmatch page to invite a friend.
            </p>
          </div>

          <div className="mx-auto md:mx-0">
            <div className="relative h-44 w-44">
              <Image
                alt="QuickVibe"
                src="/favicon.ico"
                fill
                className="rounded-2xl opacity-90"
                sizes="176px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* game grid */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="mb-4 text-xl font-semibold text-zinc-200">
          Games (alpha)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <div
              key={g.slug}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold">{g.title}</h3>
                {g.soon ? (
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                    coming soon
                  </span>
                ) : null}
              </div>
              <p className="mb-4 text-sm text-zinc-400">{g.blurb}</p>

              <div className="flex items-center gap-2">
                <Link
                  href={g.href ?? `/play/${g.slug}`}
                  className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 transition group-hover:bg-white"
                >
                  {g.cta ?? "Play"}
                </Link>
                <Link
                  href={`/play/${g.slug}?quick=1`}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-700"
                >
                  Quick start
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-zinc-500">
          <span>© {new Date().getFullYear()} QuickVibe Games</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
