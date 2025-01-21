"use client";

import { useUser } from "@/components/user-context";
import { useParams } from "next/navigation";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { socket } from "@/trpc/socket";
import { type GameStatus } from "@/models/game/Game";
import {
  GAME_ACTIONS,
  type GameState,
  type JoinGameHandler,
} from "@/services/GameService";

import { type PlayerState } from "../services/GameService";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import {
  type ChoosePlayerRequest,
  GAME_REQUESTS,
  type InsertCardRequest,
  InsertCardResponse,
} from "@/models/game/RequestManager";
import { playerOtionsSchema } from "@/models/Player";

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

  // Handle disconnection when user leaves the page
  useEffect(() => {
    const handleDisconnect = () => {
      if (connected && user) {
        console.log("GAME DISCONNECTED");
        socket.emit(GAME_ACTIONS.DISCONNECT, {
          gameId,
          player: user,
        });
        setConnected(false);
      }
    };

    // Handle tab/window close
    window.addEventListener("beforeunload", handleDisconnect);

    // Handle navigation away (back button, etc)
    window.addEventListener("popstate", handleDisconnect);

    return () => {
      handleDisconnect();
      window.removeEventListener("beforeunload", handleDisconnect);
      window.removeEventListener("popstate", handleDisconnect);
    };
  }, [connected, gameId]);

  useEffect(() => {
    const attemptConnection = () => {
      if (!connected && playerOtionsSchema.safeParse(user).success) {
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
        setPlayerState(_playerState);
      });

      return () => {
        socket.off(GAME_ACTIONS.SYNC, (gameState: GameState) => {
          setGameState(null);
          setGameStatus(gameState.status);
        });

        socket.off(GAME_ACTIONS.PLAYER_SYNC, (_playerState: PlayerState) => {
          setPlayerState(null);
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

type CancelCallback = (val: boolean) => void;
export function useCancelDialog(): (callback: CancelCallback) => void {
  const gameId = useGameId();
  const callbackRef = useRef<CancelCallback | null>(null);

  useEffect(() => {
    const handleCancelDialogs = () => {
      if (callbackRef.current) {
        callbackRef.current(false);
      }
    };

    socket.on(GAME_REQUESTS.CANCEL_DIALOG, handleCancelDialogs);

    return () => {
      socket.off(GAME_REQUESTS.CANCEL_DIALOG, handleCancelDialogs);
    };
  }, [gameId]);

  const onCancelChange = useCallback((callback: CancelCallback) => {
    callbackRef.current = callback;
  }, []);

  return onCancelChange;
}

export function useGameId() {
  const params = useParams();
  const gameId = params.gameId as string;
  return gameId;
}
