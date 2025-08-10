"use client";
import { useEffect, useState } from "react";
import * as Colyseus from "colyseus.js";

export default function RtTest() {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_RT_URL || "ws://localhost:2567";
    const client = new Colyseus.Client(url);
    let room: Colyseus.Room | undefined;

    (async () => {
      try {
        room = await client.joinOrCreate("ping", {});
        setLog(L => [...L, "joined: " + room!.roomId]);
        room.onMessage("msg", m => setLog(L => [...L, "msg: " + JSON.stringify(m)]));
        room.send("msg", "hello from browser");
      } catch (e: any) {
        setLog(L => [...L, "error: " + (e?.message ?? String(e))]);
      }
    })();

    return () => { room?.leave(); };
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">RT test</h1>
      <p className="text-white/70">Open this page in two tabs — you should see join/leave + messages.</p>
      <pre className="text-xs bg-black/40 rounded-xl p-4 border border-white/10 whitespace-pre-wrap">
        {log.join("\n")}
      </pre>
    </div>
  );
}
