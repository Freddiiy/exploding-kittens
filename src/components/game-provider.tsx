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
  GameState,
  type GameHandler,
  type JoinGameHandler,
  type RejoinGameHandler,
} from "@/services/GameService";
import type Deck from "@/models/Card";

import { type PlayerState } from "../services/GameService";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { BaseCardJSON } from "@/models/cards/_BaseCard";
import { flushSync } from "react-dom";

interface GameContext {
  connected: boolean;
  retryCount: number;
  gameState: GameState | null;
  gameStatus: GameStatus | "notFound";
  playerState: PlayerState | null;
  lastPlayedCard: BaseCardJSON | null;
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

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [lastPlayedCard, setLastPlayedCard] = useState<BaseCardJSON | null>(
    null,
  );

  const { user } = useUser();

  useEffect(() => {
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

  useEffect(() => {
    if (connected) {
      socket.emit(GAME_ACTIONS.GET_SYNC, gameId, (response?: GameStatus) => {
        if (response) {
          setGameStatus(response);
        }
      });

      socket.on(GAME_ACTIONS.SYNC, (gameState: GameState) => {
        setGameState(gameState);
        setGameStatus(gameState.status);
      });

      socket.on(GAME_ACTIONS.PLAYER_SYNC, (_playerState: PlayerState) => {
        setLastPlayedCard(_playerState.latestCard);
        setTimeout(() => setPlayerState(_playerState), 10);
        setTimeout(() => setLastPlayedCard(null), 10);
      });

      return () => {
        socket.off(GAME_ACTIONS.SYNC, (gameState: GameState) => {
          setGameState(gameState);
          setGameStatus(gameState.status);
        });
      };
    }
  }, [gameId, connected]);

  return (
    <GameContext.Provider
      value={{
        connected,
        retryCount,
        gameState,
        gameStatus,
        playerState,
        lastPlayedCard,
      }}
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
