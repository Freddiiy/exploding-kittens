"use client";

import { useUser } from "@/components/user-context";
import { useSync } from "@/hooks/useSync";
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
import { Game } from "@/models/Game";
import { GAME_ACTIONS } from "@/services/GameService";

interface GameContext {
  gameState: Game | undefined;
  setGameState: Dispatch<SetStateAction<Game | undefined>>;
}
const GameContext = createContext<GameContext | null>(null);

interface GameProviderProps {
  children: ReactNode;
}
export function GameProvider({ children }: GameProviderProps) {
  const [connectedToGame, setConnectedToGame] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

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

  return <>{children}</>;
}

export function useGame() {
  const gameCtx = useContext(GameContext);
  if (!gameCtx) {
    throw new Error("useGame can only be used inside a GameContext provider");
  }

  return gameCtx;
}
