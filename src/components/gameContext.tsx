"use client";

import { useUser } from "@/components/user-context";
import { useSync } from "@/hooks/useSync";
import type GameState from "@/models/GameState";
import { GAME_ACTIONS } from "@/server/api/handlers/actions";
import { joinGameHandler } from "@/server/api/handlers/joinGameHandler";
import { useParams } from "next/navigation";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "@/trpc/socket";

interface GameContext {
  gameState: GameState | undefined;
  setGameState: Dispatch<SetStateAction<GameState | undefined>>;
}
const GameContext = createContext<GameContext | null>(null);

interface GameProviderProps {
  children: ReactNode;
}
export function GameProvider({ children }: GameProviderProps) {
  const [connectedToGame, setConnectedToGame] = useState(false);
  const [gameState, setGameState] = useState<GameState>();

  const params = useParams();
  const gameId = params.gameId as string;
  const { user } = useUser();

  if (!connectedToGame) {
    socket.emit(
      GAME_ACTIONS.JOIN,
      {
        gameId,
        player: user,
      },
      (response?: "connected") => {
        setConnectedToGame(response === "connected" ?? false);
      },
    );
  }

  useEffect(() => {
    socket.on(GAME_ACTIONS.SYNC, (data: GameState) => setGameState(data));

    return () => {
      socket.off(GAME_ACTIONS.SYNC, (data: GameState) => setGameState(data));
    };
  }, []);

  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
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
