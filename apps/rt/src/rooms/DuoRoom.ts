import { Room, Client } from "colyseus";

// Simple state (no schema for the skeleton)
type State = {
  seats: string[];           // sessionIds in join order (max 2)
  startedAt?: number;        // epoch ms when match starts (for countdown)
  results?: {
    scores: Record<string, number>;
    winner: string | null;   // sessionId or null for tie
  };
};

export class DuoRoom extends Room<State> {
  private scores = new Map<string, number>();
  private ready  = new Set<string>();

  onCreate(options: { code?: string }) {
    this.maxClients = 2;
    this.setState({ seats: [] });

    // chat (used by our test pages)
    this.onMessage("chat", (client, message: unknown) => {
      this.broadcast("chat", { from: client.sessionId, message });
    });

    // both players press "ready" -> broadcast start time
    this.onMessage("ready", (client) => {
      this.ready.add(client.sessionId);
      if (this.ready.size === 2 && !this.state.startedAt) {
        // start in ~1.5s so both can show a countdown
        this.state.startedAt = Date.now() + 1500;
        this.broadcast("start", { at: this.state.startedAt });
      }
    });

    // player sends final score after 10s
    this.onMessage("score", (client, message: { score: number; durationMs?: number }) => {
      const n = Math.max(0, Number(message?.score ?? 0));
      this.scores.set(client.sessionId, n);

      if (this.scores.size === 2) {
        const entries = [...this.scores.entries()];
        const [aId, aScore] = entries[0];
        const [bId, bScore] = entries[1];
        const winner = aScore === bScore ? null : (aScore > bScore ? aId : bId);

        this.state.results = { scores: Object.fromEntries(this.scores), winner };
        this.broadcast("result", this.state.results);

        // allow rematch in the same room
        this.ready.clear();
        this.scores.clear();
        this.state.startedAt = undefined;
      }
    });
  }

  onJoin(client: Client) {
    if (this.state.seats.length < 2) this.state.seats.push(client.sessionId);
    this.broadcast("chat", `joined: ${client.sessionId}`);
  }

  onLeave(client: Client) {
    this.ready.delete(client.sessionId);
    this.scores.delete(client.sessionId);
    this.broadcast("chat", `left: ${client.sessionId}`);
  }
}
