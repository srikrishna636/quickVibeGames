import { Room, Client } from "colyseus";

export class PingRoom extends Room {
  onCreate() {
    this.setState({});
    this.onMessage("msg", (client, message: unknown) => {
      this.broadcast("msg", { from: client.sessionId, message });
    });
  }
  onJoin(client: Client) {
    this.broadcast("msg", `joined: ${client.sessionId}`);
  }
  onLeave(client: Client) {
    this.broadcast("msg", `left: ${client.sessionId}`);
  }
}
