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
  PlayerClient,
  type GameState,
  type JoinGameHandler,
} from "@/services/GameService";

import { type PlayerState } from "../services/GameService";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import {
  type ChoosePlayerRequest,
  type ChoosePlayerResponse,
  GAME_REQUESTS,
  GiveCardResponse,
  type SelectCardRequest,
  SelectCardResponse,
} from "@/models/game/PlayerManager";

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

  useGameRequest(connected);

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
        setPlayerState(_playerState);
      });

      return () => {
        socket.off(GAME_ACTIONS.SYNC, (gameState: GameState) => {
          setGameState(gameState);
          setGameStatus(gameState.status);
        });

        socket.off(GAME_ACTIONS.PLAYER_SYNC, (_playerState: PlayerState) => {
          setPlayerState(_playerState);
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

function useGameRequest(connected: boolean) {
  const gameId = useGameId();
  useEffect(() => {
    socket.on(GAME_REQUESTS.SELECT_CARD, (data: SelectCardRequest) => {
      console.log("SELECT CARD REQUEST FROM ", data.handSize);
    });

    socket.on(GAME_REQUESTS.GIVE_CARD, (data: SelectCardRequest) => {});

    return () => {
      socket.off(GAME_REQUESTS.SELECT_CARD, (data: SelectCardRequest) => {
        console.log("SELECT CARD REQUEST FROM ", data.handSize);
      });

      socket.off(GAME_REQUESTS.GIVE_CARD, (data: SelectCardRequest) => {
        console.log("SELECT CARD REQUEST FROM ", data.handSize);
      });
    };
  }, [gameId, connected]);
}

export function usePlayerSelection() {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerClient[]>([]);
  const onCancelChange = useCancelDialog();
  onCancelChange((val) => {
    console.log("SELECT PLAYER", val);
    setIsDialogOpen(false);
  });

  function handlePlayerSelect(selectedPlayerId: string) {
    setIsDialogOpen(false);
    const response: ChoosePlayerResponse = {
      selectedPlayerId,
    };
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, response);
  }

  function handleCancel() {
    setIsDialogOpen(false);
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, {
      error: "Player selection cancelled",
    });
  }

  function openPlayerSelection(players: PlayerClient[]) {
    setAvailablePlayers(players);
    setIsDialogOpen(true);
  }

  useEffect(() => {
    socket.on(
      GAME_REQUESTS.CHOOSE_PLAYER,
      (data: { availablePlayers: PlayerClient[] }) => {
        openPlayerSelection(data.availablePlayers);
      },
    );

    return () => {
      socket.off(GAME_REQUESTS.CHOOSE_PLAYER);
    };
  }, [gameId]);

  return {
    isDialogOpen,
    availablePlayers,
    handlePlayerSelect,
    handleCancel,
  };
}

interface GiveCardDialogProps {
  isDialogOpen: boolean;
  availableCards: BaseCardJSON[];
  handleCardSelect(cardId: string): void;
  handleCancel(): void;
}
const GiveCardContext = createContext<GiveCardDialogProps | null>(null);

interface GiveCardProviderProps {
  children: ReactNode;
}
export function GiveCardProvider({ children }: GiveCardProviderProps) {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableCards, setAvailableCards] = useState<BaseCardJSON[]>([]);

  const onCancelChange = useCancelDialog();
  onCancelChange((val) => {
    console.log("GIVE CARD", val);
    setIsDialogOpen(false);
  });

  function handleCardSelect(cardId: string) {
    const response: GiveCardResponse = {
      cardId,
    };
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, response);
    setIsDialogOpen(false);
  }

  function handleCancel() {
    setIsDialogOpen(false);
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, {
      error: "Card selection cancelled",
    });
  }

  function onCardSelection(cards: BaseCardJSON[]) {
    setAvailableCards(cards);
    setIsDialogOpen(true);
  }

  useEffect(() => {
    socket.on(
      GAME_REQUESTS.GIVE_CARD,
      (data: { availableCards: BaseCardJSON[] }) => {
        onCardSelection(data.availableCards);
      },
    );

    return () => {
      socket.off(GAME_REQUESTS.GIVE_CARD);
    };
  }, [gameId]);

  return (
    <GiveCardContext.Provider
      value={{ isDialogOpen, availableCards, handleCardSelect, handleCancel }}
    >
      {children}
    </GiveCardContext.Provider>
  );
}

export function useGiveCard() {
  const giveCardCtx = useContext(GiveCardContext);
  if (!giveCardCtx) {
    throw new Error("useGiveCard can only be used inside a GiveCard provider");
  }

  return giveCardCtx;
}

type CancelCallback = (val: boolean) => void;
function useCancelDialog(): (callback: CancelCallback) => void {
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
