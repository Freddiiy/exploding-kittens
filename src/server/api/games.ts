import { type GameLogic } from "@/models/GameLogic";

export const activeGames = new Map<string, GameLogic>();
export function getGame(gameId: string) {
  const game = activeGames.get(gameId);
  if (!game) {
    throw new Error("No game found");
  }

  return game;
}
