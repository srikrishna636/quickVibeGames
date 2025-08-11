"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CopyState = "idle" | "ok" | "err";

const GAME_SLUG = "duo"; // future-proof: change to another slug if needed

function randomCode(len = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function inviteUrlFor(origin: string, code: string) {
  const clean = code.toUpperCase().trim();
  return `${origin}/play/${GAME_SLUG}?code=${encodeURIComponent(clean)}`;
}

async function safeShare(url: string) {
  try {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      await nav.share({ title: "QuickVibe Duo", text: "Join my match!", url });
      return true;
    }
  } catch {
    // user cancelled / not allowed
  }
  try {
    if ("clipboard" in navigator && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // ignore; fallback below
  }
  // last-resort copy
  try {
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

export default function QuickmatchPage() {
  const router = useRouter();

  const [code, setCode] = useState<string>(randomCode());
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<CopyState>("idle");
  const [reserved, setReserved] = useState(false); // true after Create/Host successfully reserves a room

  const urlHTTP = process.env.NEXT_PUBLIC_RT_HTTP || "http://localhost:2567";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = useMemo(() => inviteUrlFor(origin, code), [origin, code]);

  const push = (m: string) => setLog((L) => [...L, m]);

  useEffect(() => {
    setLog([]);
    setReserved(false);
    setCopied("idle");
  }, [code]);

  function normalize(input: string) {
    return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  }

  async function reserveRoom(c: string) {
    type MatchResp = { ok?: boolean; roomId?: string; error?: string };
    const res = await fetch(`${urlHTTP}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: GAME_SLUG, code: c })
    });
    const data = (await res.json()) as MatchResp;
    if (!res.ok || !data.ok || !data.roomId) {
      throw new Error(data.error || "match failed");
    }
    return data.roomId;
  }

  async function onCreateHost() {
    const c = normalize(code);
    if (c.length < 4) {
      push("error: code must be at least 4 characters (A–Z / 2–9)");
      return;
    }
    setBusy(true);
    try {
      const roomId = await reserveRoom(c);
      setReserved(true);
      push(`host: code ${c} → room ${roomId}`);
      push(`share this link: ${inviteUrlFor(origin, c)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      push("error: " + msg);
    } finally {
      setBusy(false);
    }
  }

  function onJoin() {
    const c = normalize(code);
    if (c.length < 4) {
      push("error: code must be at least 4 characters (A–Z / 2–9)");
      return;
    }
    router.push(`/play/${GAME_SLUG}?code=${encodeURIComponent(c)}`);
  }

  function onQuick() {
    router.push(`/play/${GAME_SLUG}?quick=1`);
  }

  async function onCopy() {
    const ok = await safeShare(inviteUrl);
    setCopied(ok ? "ok" : "err");
    setTimeout(() => setCopied("idle"), 1500);
    if (ok) push("invite link copied/shared");
    else push("copy failed (try manually)");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quickmatch — {GAME_SLUG.toUpperCase()}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={code}
          onChange={(e) => setCode(normalize(e.target.value))}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-mono"
          maxLength={8}
          aria-label="Room code"
          placeholder="AB12"
        />

        <button
          className="rounded-2xl px-4 py-2 bg-gradient-to-r from-mint to-aqua text-ink font-semibold disabled:opacity-50"
          onClick={onCreateHost}
          disabled={busy}
          title="Create or reuse a room for this friend code"
        >
          Create / Host
        </button>

        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5 disabled:opacity-50"
          onClick={onJoin}
          disabled={busy}
          title="Join the room using this code"
        >
          Join
        </button>

        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
          onClick={() => setCode(randomCode())}
          title="Generate a new random code"
        >
          New code
        </button>

        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
          onClick={onQuick}
          title="Quickmatch (no code)"
        >
          Quickmatch
        </button>
      </div>

      {/* Invite row */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          readOnly
          value={inviteUrl}
          className="w-full sm:w-auto flex-1 min-w-[320px] rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-mono"
          aria-label="Invite link"
        />
        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
          onClick={onCopy}
          title="Copy (or share on mobile) the invite link"
        >
          {copied === "ok" ? "Copied ✓" : copied === "err" ? "Copy failed" : "Copy / Share"}
        </button>

        {reserved && (
          <button
            className="rounded-2xl px-4 py-2 bg-gradient-to-r from-aqua to-mint text-ink font-semibold"
            onClick={() => router.push(`/play/${GAME_SLUG}?code=${encodeURIComponent(code)}`)}
            title="Open the game now"
          >
            Open Game
          </button>
        )}
      </div>

      <pre className="text-xs whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10 min-h-[140px]">
        {log.join("\n")}
      </pre>

      <p className="text-white/60 text-sm">
        Tip: share the invite link with a friend. They’ll land on{" "}
        <code className="px-1 py-0.5 bg-white/10 rounded">/play/{GAME_SLUG}?code=XXXX</code>.
      </p>
    </div>
  );
}
