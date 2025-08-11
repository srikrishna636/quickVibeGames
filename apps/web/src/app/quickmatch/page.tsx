"use client";
import { useEffect, useMemo, useState } from "react";
import * as Colyseus from "colyseus.js";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Quickmatch() {
  const [code, setCode] = useState(randomCode());
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const urlWS = process.env.NEXT_PUBLIC_RT_URL || "ws://localhost:2567";
  const urlHTTP = process.env.NEXT_PUBLIC_RT_HTTP || "http://localhost:2567";
  const client = useMemo(() => new Colyseus.Client(urlWS), [urlWS]);

  const push = (m: string) => setLog((L) => [...L, m]);

  async function createOrGetRoomId(c: string): Promise<string> {
    const res = await fetch(`${urlHTTP}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c }),
    });
    const data: { ok?: boolean; roomId?: string; error?: string } = await res.json();
    if (!res.ok || !data?.ok || !data.roomId) throw new Error(data?.error || "match failed");
    return data.roomId;
  }

  async function joinByIdWithRetry(roomId: string, tries = 8, waitMs = 200) {
    for (let i = 0; i < tries; i++) {
      try {
        return await client.joinById(roomId);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("not found") && i < tries - 1) {
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }
        throw e instanceof Error ? e : new Error(String(e));
      }
    }
  }

  async function go(host: boolean) {
    setBusy(true);
    try {
      const c = code.toUpperCase().trim();
      if (!/^[A-Z0-9]{4,8}$/.test(c)) throw new Error("invalid code");

      const roomId = await createOrGetRoomId(c);
      push(`${host ? "Created/Found" : "Joining"} code ${c} -> ${roomId}`);

      if (host) {
        push(`Host ready. Open /duo?code=${c} in both tabs to play.`);
        return;
      }

      const room = await joinByIdWithRetry(roomId);
      push("joined: " + (room?.roomId ?? "(unknown)"));

      room?.onMessage("chat", (m: unknown) => push("chat: " + JSON.stringify(m)));
      room?.onMessage("ready", () => push("READY: both players present"));
      room?.send("chat", { msg: "guest hello" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      push("error: " + msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => setLog([]), [code]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quickmatch (2-player)</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-mono"
          maxLength={8}
          aria-label="Room code"
        />
        <button
          className="rounded-2xl px-4 py-2 bg-gradient-to-r from-mint to-aqua text-ink font-semibold disabled:opacity-50"
          onClick={() => go(true)}
          disabled={busy}
        >
          Create / Host
        </button>
        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5 disabled:opacity-50"
          onClick={() => go(false)}
          disabled={busy}
        >
          Join
        </button>
        <button
          className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
          onClick={() => setCode(randomCode())}
        >
          New code
        </button>
      </div>

      <pre className="text-xs whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10 min-h-[140px]">
        {log.join("\n")}
      </pre>

      <p className="text-white/60 text-sm">
        After <b>Create / Host</b>, open <b>/duo?code={code}</b> in both tabs to play the match.
      </p>
    </div>
  );
}
