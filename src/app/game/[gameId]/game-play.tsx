"use client";

import { useGame } from "@/components/game-provider";
import { Lobby } from "./lobby";
import { Board } from "@/components/kittens/board";

export function GamePlay() {
  const { gameState, gameStatus } = useGame();

  if (gameStatus === "notFound") {
    return <div>Game not found</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  if (gameStatus === "waiting") {
    return <Lobby />;
  }

  return <Board />;
}
