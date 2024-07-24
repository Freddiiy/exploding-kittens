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
import { GameStatus, type Game } from "@/models/game/Game";
import {
  GAME_ACTIONS,
  type GameHandler,
  type JoinGameHandler,
  type RejoinGameHandler,
} from "@/services/GameService";
import type Deck from "@/models/Card";

import { type PlayerSpecificGameState } from "../services/GameService";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

interface GameContext {
  connected: boolean;
  retryCount: number;
  gameState: PlayerSpecificGameState | null;
  gameStatus: GameStatus | "notFound";
}

const GameContext = createContext<GameContext | null>(null);

interface GameProviderProps {
  children: ReactNode;
}
export function GameProvider({ children }: GameProviderProps) {
  const gameId = useGameId();
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus | "notFound">(
    "waiting",
  );

  const [gameState, setGameState] = useState<PlayerSpecificGameState | null>(
    null,
  );
  useEffect(() => {
    socket.emit(GAME_ACTIONS.GET_SYNC, gameId, (response?: GameStatus) => {
      if (response) {
        setGameStatus(response);
      }
    });
    socket.on(GAME_ACTIONS.SYNC, (gameState: PlayerSpecificGameState) => {
      setGameState(gameState);
    });

    return () => {
      socket.off(GAME_ACTIONS.SYNC, (gameState: PlayerSpecificGameState) =>
        setGameState(gameState),
      );
    };
  }, [gameId]);

  const { user } = useUser();

  useEffect(() => {
    if (!gameState) return;
    const attemptConnection = () => {
      if (!connected) {
        const joinHandlerObj: JoinGameHandler = {
          gameId,
          player: user,
        };
        socket.emit(
          GAME_ACTIONS.JOIN,
          joinHandlerObj,
          (response?: "connected") => {
            if (response === "connected") {
              setConnected(true);
            } else {
              // If connection fails, increment retry count and try again after delay
              setRetryCount((prevCount) => prevCount + 1);
            }
          },
        );
      }
    };

    if (!connected) {
      const delay = Math.min(30000, 1000 * Math.pow(2, retryCount)); // Exponential backoff, max 30 seconds
      const timer = setTimeout(attemptConnection, delay);
      return () => clearTimeout(timer);
    }
  }, [connected, gameId, gameState, retryCount, user]);
  return (
    <GameContext.Provider
      value={{ connected, retryCount, gameState, gameStatus }}
    >
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
