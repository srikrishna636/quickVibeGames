export type GameMeta = {
  slug: string;           // e.g., "duo"
  title: string;          // human name
  roomName: string;       // Colyseus room name
  modes: { quick: boolean; friend: boolean };
  description?: string;
};
