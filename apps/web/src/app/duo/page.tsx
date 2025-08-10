"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Colyseus from "colyseus.js";

function msLeft(at: number) {
  return Math.max(0, at - Date.now());
}

export default function Duo() {
  const urlWS   = process.env.NEXT_PUBLIC_RT_URL  || "ws://localhost:2567";
  const urlHTTP = process.env.NEXT_PUBLIC_RT_HTTP || "http://localhost:2567";
  const client  = useMemo(() => new Colyseus.Client(urlWS), [urlWS]);

  const [code, setCode] = useState<string>("");
  const [room, setRoom] = useState<Colyseus.Room | null>(null);
  const [log,  setLog]  = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [opp,   setOpp]   = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle"|"joined"|"countdown"|"playing"|"done">("idle");

  const startAtRef = useRef<number | null>(null);
  const timerRef   = useRef<any>(null);
  const countRef   = useRef(0);
  useEffect(() => { countRef.current = count; }, [count]);

  const push = (m: string) => setLog((L) => [...L, m]);

  const joinByCode = useCallback(async (c: string) => {
    // ask server to create/fetch a roomId for this code
    const res = await fetch(`${urlHTTP}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || "match failed");

    const roomId: string = data.roomId;

    // retry join a few times to avoid "room not found" race
    async function joinByIdWithRetry(id: string, tries = 8, waitMs = 200) {
      let last: any;
      for (let i = 0; i < tries; i++) {
        try {
          return await client.joinById(id);
        } catch (e: any) {
          const msg = String(e?.message || e);
          if (msg.includes("not found") && i < tries - 1) {
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          last = e;
          break;
        }
      }
      throw last ?? new Error("join failed");
    }

    const r = await joinByIdWithRetry(roomId);
    setRoom(r);
    setPhase("joined");
    push(`joined: ${r.roomId}`);

    r.onMessage("start", ({ at }: { at: number }) => {
      startAtRef.current = at;
      setPhase("countdown");
      setCount(0);
      push(`start at: ${new Date(at).toLocaleTimeString()}`);

      const tick = () => {
        if (!startAtRef.current) return;
        if (msLeft(at) <= 0) {
          setPhase("playing");
          startAtRef.current = null;
          clearInterval(timerRef.current);
          setTimeout(() => {
            r.send("score", { score: countRef.current, durationMs: 10000 });
            setPhase("done");
          }, 10000);
        }
      };
      clearInterval(timerRef.current);
      timerRef.current = setInterval(tick, 50);
    });

    r.onMessage("chat", (m) => push(`chat: ${JSON.stringify(m)}`));
    r.onMessage("result", (payload: { scores: Record<string,number>, winner: string|null }) => {
      const myId  = r.sessionId;
      const hisId = Object.keys(payload.scores).find((k) => k !== myId);
      setOpp(hisId ? payload.scores[hisId] : null);

      const myScore = payload.scores[myId] ?? 0;
      const their   = hisId ? payload.scores[hisId] : 0;
      const verdict = myScore === their ? "Tie!" : (myScore > their ? "You win!" : "You lose!");
      push(`result -> you:${myScore} opp:${their} (${verdict})`);
      setPhase("done");
    });
  }, [client, urlHTTP]);

  const tap = useCallback(() => {
    if (phase !== "playing") return;
    setCount((c) => c + 1);
  }, [phase]);

  const readyUp = useCallback(() => { room?.send("ready"); }, [room]);

  useEffect(() => {
    const u = new URL(window.location.href);
    const q = (u.searchParams.get("code") || "").toUpperCase();
    if (q) setCode(q);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Duo Tapper</h1>

      {phase === "idle" && (
        <div className="flex gap-3 items-center">
          <input
            value={code}
            onChange={(e)=>setCode(e.target.value.toUpperCase())}
            placeholder="Room code (e.g. AB12)"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 font-mono"
            maxLength={8}
          />
          <button
            className="rounded-2xl px-4 py-2 bg-gradient-to-r from-mint to-aqua text-ink font-semibold disabled:opacity-50"
            disabled={!/^[A-Z0-9]{4,8}$/.test(code)}
            onClick={() => joinByCode(code)}
          >
            Join room
          </button>
        </div>
      )}

      {phase !== "idle" && (
        <div className="space-y-3">
          <div className="text-white/80 text-sm">
            Code: <b className="font-mono">{code}</b> • Phase: <b>{phase}</b>
          </div>

          {phase === "joined" && (
            <button className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
                    onClick={readyUp}>
              Ready
            </button>
          )}

          {phase === "countdown" && (
            <div className="text-xl">Get ready… starting in ~1.5s</div>
          )}

          {phase === "playing" && (
            <div className="space-y-3">
              <div className="text-lg">Tap as fast as you can for 10s!</div>
              <button className="rounded-2xl px-6 py-8 bg-white/10 hover:bg-white/20"
                      onClick={tap}>
                TAP (+1)
              </button>
              <div className="text-2xl font-mono">You: {count}{opp != null && <span> • Opp: {opp}</span>}</div>
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-2">
              <div className="text-lg">Round submitted. Check “result” below.</div>
              <button className="rounded-2xl px-4 py-2 border border-white/15 hover:bg-white/5"
                      onClick={() => { setCount(0); setOpp(null); setPhase("joined"); }}>
                Rematch (same code)
              </button>
            </div>
          )}
        </div>
      )}

      <pre className="text-xs whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10 min-h-[140px]">
        {log.join("\n")}
      </pre>

      <p className="text-white/60 text-sm">
        Share a code from <a className="underline" href="/quickmatch">/quickmatch</a> or paste it here with <code>?code=AB12</code>.
      </p>
    </div>
  );
}
