"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useGame, useGameId } from "../game-provider";
import { NOPE_TIMER } from "@/models/game/ActionManager";
import { socket } from "@/trpc/socket";
import { GAME_ACTIONS } from "@/services/GameService";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { useUser } from "../user-context";
import { playCard } from "@/lib/actions";
import { CardType } from "@/models/cards/_CardType";

interface NopeTimerContextProps {
  progress: number;
  canBeNoped: boolean;
  hasNopeOnHand: boolean;
  playNope(): void;
  isTimerCompleted: boolean;
}

const NopeTimerContext = createContext<NopeTimerContextProps | null>(null);

interface NopeTimerProviderProps {
  children: ReactNode;
}

const timerOffset = 1500;
const nopeTimer = NOPE_TIMER - timerOffset;
export function NopeTimerProvider({ children }: NopeTimerProviderProps) {
  const [isTimerCompleted, setIsTimerCompleted] = useState(false);
  const { gameState, playerState } = useGame();
  const { user } = useUser();
  const gameId = useGameId();
  const [timerEnd, setTimerEnd] = useState(Date.now());
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const handlePlayCard = () => {
      setTimerEnd(Date.now() + nopeTimer);
      setIsTimerCompleted(false);
    };

    socket.on(GAME_ACTIONS.PLAY_CARD, handlePlayCard);

    return () => {
      socket.off(GAME_ACTIONS.PLAY_CARD, handlePlayCard);
    };
  }, [gameId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = timerEnd - Date.now();
      const newProgress = Math.max((timeLeft / nopeTimer) * 100, 0);
      setProgress(newProgress);

      if (newProgress === 0) {
        setIsTimerCompleted(true);
      }
    }, 100); // Update progress every 100ms

    return () => clearInterval(interval);
  }, [timerEnd]);

  const hasNopeOnHand =
    playerState?.playerHandOfCards.some(
      (card) => card.type === CardType.NOPE,
    ) ?? false;
  const canBeNoped = progress > 0;

  function playNope() {
    if (canPressSpace) {
      setCanPressSpace(false);
      setTimeout(() => setCanPressSpace(true), 1000);

      if (gameState && canBeNoped) {
        const nopeCard = playerState?.playerHandOfCards.find(
          (x) => x.type === CardType.NOPE,
        );

        if (nopeCard && nopeCard.type === CardType.NOPE) {
          playCard(gameState.id, user.userId, [nopeCard.cardId]);
        }
      }
    }
  }

  const [canPressSpace, setCanPressSpace] = useState(true);
  const handleSpacePress = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "Space" && canPressSpace) {
        playNope();
      }
    },
    [
      canPressSpace,
      gameState,
      canBeNoped,
      playerState?.playerHandOfCards,
      user.userId,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleSpacePress);
    return () => {
      window.removeEventListener("keydown", handleSpacePress);
    };
  }, [handleSpacePress]);

  return (
    <NopeTimerContext.Provider
      value={{
        progress,
        canBeNoped,
        hasNopeOnHand,
        playNope,
        isTimerCompleted,
      }}
    >
      {children}
    </NopeTimerContext.Provider>
  );
}

export function useNopeTimer() {
  const nopeTimerCtx = useContext(NopeTimerContext);
  if (!nopeTimerCtx) {
    throw new Error(
      "useNopeTimer can only be used inside a NopeTimer provider",
    );
  }

  return nopeTimerCtx;
}

export function NopeTimer() {
  const { progress, playNope, canBeNoped, hasNopeOnHand } = useNopeTimer();

  return (
    <div className="flex w-full flex-col justify-center gap-2">
      <div>
        <Progress value={progress} />
      </div>
      {hasNopeOnHand && (
        <div>
          <Button
            type="button"
            variant={"destructive"}
            size={"lg"}
            className="w-full"
            onClick={() => playNope()}
            disabled={!canBeNoped}
          >
            NOPE
          </Button>
        </div>
      )}
    </div>
  );
}
