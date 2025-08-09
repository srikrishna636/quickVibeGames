export default function Home() {
  return (
    <section className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-black leading-tight">
          Play quick, <span className="text-mint">vibey</span> games.
        </h1>
        <p className="text-white/70 max-w-prose">
          No installs, no sign-up. Hit “Play now” for solo runs, invite a friend for 1v1,
          or quickmatch with someone online. Leaderboards keep score — more coming soon.
        </p>
        <div className="flex gap-3">
          <a href="/play" className="inline-flex items-center rounded-2xl px-5 py-3 bg-gradient-to-r from-mint to-aqua text-ink font-semibold shadow-[var(--shadow-neon)] hover:opacity-90">
            Play now
          </a>
          <a href="/games" className="rounded-2xl px-5 py-3 border border-white/15 hover:bg-white/5">
            Browse games
          </a>
        </div>
        <p className="font-mono text-xs text-white/50">UI font: Plus Jakarta Sans · Numbers: Space Mono</p>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-electric/30 via-mint/30 to-aqua/30 grid place-items-center">
          <span className="font-mono text-sm text-white/80">Hero art placeholder — game thumbnails will go here</span>
        </div>
      </div>
    </section>
  );
}
