"use client";
import { useEffect, useMemo, useState } from "react";
import * as Colyseus from "colyseus.js";

export default function RtTest() {
  const urlWS = process.env.NEXT_PUBLIC_RT_URL || "ws://localhost:2567";
  const client = useMemo(() => new Colyseus.Client(urlWS), [urlWS]);

  const [log, setLog] = useState<string[]>([]);
  const push = (m: string) => setLog((L) => [...L, m]);

  useEffect(() => {
    let mounted = true;

    async function go() {
      try {
        const room = await client.joinOrCreate("duo");
        if (!mounted) return;

        push(`joined: ${room.roomId}`);
        room.onMessage("chat", (msg: unknown) => push(`msg: ${JSON.stringify(msg)}`));

        // say hello so we see traffic
        room.send("chat", { message: "hello from browser" });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        push(`error: ${msg}`);
      }
    }

    go();
    return () => { mounted = false; };
  }, [client]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">RT test</h1>
      <p>Open this page in two tabs — you should see join/leave + messages.</p>
      <pre className="text-xs whitespace-pre-wrap bg-black/40 rounded-xl p-4 border border-white/10 min-h-[120px]">
        {log.join("\n")}
      </pre>
    </div>
  );
}
