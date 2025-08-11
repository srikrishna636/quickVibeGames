import http from "http";
import express, { Request, Response } from "express";
import cors from "cors";
import { Server, matchMaker } from "colyseus";
import { DuoRoom } from "./rooms/DuoRoom";

const PORT = Number(process.env.PORT ?? 2567);

const app = express();
app.use(cors({ origin: ["https://quickvibe.games", /\.vercel\.app$/], credentials: false }));
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({ server });

// dev-only map: friend-code -> roomId
const codeMap = new Map<string, string>();

gameServer.define("duo", DuoRoom);

// health
app.get("/", (_req: Request, res: Response) => res.send("ok"));

// POST /match { code: "AB12" } -> { ok:true, roomId:"..." }
app.post("/match", async (req: Request, res: Response) => {
  try {
    const codeRaw = String((req.body?.code ?? "")).toUpperCase().slice(0, 8);
    if (!codeRaw) return res.status(400).json({ ok: false, error: "code required" });

    const existing = codeMap.get(codeRaw);
    if (existing) return res.json({ ok: true, roomId: existing });

    const room = await matchMaker.createRoom("duo", { code: codeRaw } as any);
    codeMap.set(codeRaw, room.roomId);

    // TTL cleanup in 1 hour (fine for local dev)
    setTimeout(() => {
      if (codeMap.get(codeRaw) === room.roomId) codeMap.delete(codeRaw);
    }, 60 * 60 * 1000);

    return res.json({ ok: true, roomId: room.roomId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ ok: false, error: msg });
  }
});

server.listen(PORT, () => {
  console.log(`RT listening on :${PORT}`);
});
