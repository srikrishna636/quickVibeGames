import type { GameMeta } from "./types";

/**
 * Temporary: we start with a single game "duo".
 * Adding new games becomes: add one more entry in GAMES.
 */
export const GAMES: Record<string, GameMeta> = {
  duo: {
    slug: "duo",
    title: "Quickmatch Duo",
    roomName: "duo",
    modes: { quick: true, friend: true },
    description: "Two-player tapper demo with quickmatch or friend code."
  }
};

export function getGame(slug: string) {
  return GAMES[slug];
}

export function listGames() {
  return Object.values(GAMES);
}
