"use client";

import Deck from "@/models/Card";
import {
  GAME_ACTIONS,
  type PlayerSpecificGameState,
} from "@/services/GameService";
import { socket } from "@/trpc/socket";
import { useEffect, useState } from "react";

export function useGameState() {
  const [gameState, setGameState] = useState<PlayerSpecificGameState | null>(
    null,
  );
  useEffect(() => {
    socket.on(GAME_ACTIONS.SYNC, (gameState: PlayerSpecificGameState) =>
      setGameState(gameState),
    );

    return () => {
      socket.off(GAME_ACTIONS.SYNC, () => setGameState(null));
    };
  });

  return { gameState };
}
