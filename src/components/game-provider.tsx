"use client";

import { useUser } from "@/components/user-context";
import { useParams } from "next/navigation";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "@/trpc/socket";
import { type Player } from "@/models/Player";
import { type Game } from "@/models/game/Game";
import { GAME_ACTIONS } from "@/services/GameService";
import type Deck from "@/models/Card";
import { useConnectedToGame } from "@/hooks/useConnectedToGame";
import { useGameState } from "@/hooks/useGameState";
import { type PlayerSpecificGameState } from "../services/GameService";

interface GameContext {
  connected: boolean;
  retryCount: number;
  gameState: PlayerSpecificGameState | null;
}

const GameContext = createContext<GameContext | null>(null);

interface GameProviderProps {
  children: ReactNode;
}
export function GameProvider({ children }: GameProviderProps) {
  const { gameState } = useGameState();
  const { connected, retryCount } = useConnectedToGame();
  return (
    <GameContext.Provider value={{ connected, retryCount, gameState }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const gameCtx = useContext(GameContext);
  if (!gameCtx) {
    throw new Error("useGame can only be used inside a GameContext provider");
  }

  return gameCtx;
}

export function useGameId() {
  const params = useParams();
  const gameId = params.gameId as string;
  return gameId;
}
