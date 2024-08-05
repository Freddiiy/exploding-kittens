"use client";

import {
  TransparentAlertDialog,
  TransparentAlertDialogContent,
  TransparentAlertDialogFooter,
  TransparentAlertDialogHeader,
  TransparentAlertDialogTitle,
} from "./ui/transparent-alert-dialog";
import { GAME_ACTIONS, type PlayerClient } from "@/services/GameService";
import { Button } from "./ui/button";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { H3 } from "./ui/typography";

import React from "react";
import { cn } from "@/lib/utils";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { Hand } from "./kittens/hand";
import { HandContainer } from "./hand-container";
import { KittenCardBackface, KittenCardCard } from "./kittens/card";
import { LayoutGroup, motion } from "framer-motion";
import {
  type GiveCardResponse,
  GAME_REQUESTS,
  PickCardRequest,
  PickCardResponse,
} from "@/models/game/RequestManager";
import { socket } from "@/trpc/socket";
import { useGameId, useCancelDialog } from "./game-provider";

interface PickCardDialogProps {
  open: boolean;
  amountOfCards: number;
  onSelect: (cardIdx: number) => void;
  onCancel?: () => void;
}

export function PickCardDialog({
  open,
  amountOfCards,
  onSelect,
  onCancel,
}: PickCardDialogProps) {
  const [show, setShow] = useState(true);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  function handleSelect(selectedCardIdx: number) {
    onSelect(selectedCardIdx);
    setSelectedCardIdx(null);
  }

  return (
    <LayoutGroup>
      <TransparentAlertDialog open={open && show}>
        <TransparentAlertDialogContent>
          <TransparentAlertDialogHeader>
            <TransparentAlertDialogTitle>
              Pick a card to take
            </TransparentAlertDialogTitle>
          </TransparentAlertDialogHeader>
          <div className="space-y-4 py-12">
            <div className="flex h-card-height items-center justify-center gap-4">
              <HandContainer
                items={Array.from({ length: amountOfCards })}
                render={(item, i) => (
                  <button
                    className="relative h-full w-full"
                    onClick={() => setSelectedCardIdx(i)}
                  >
                    <KittenCardBackface />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg opacity-0 transition-all duration-150",
                        selectedCardIdx == null && "opacity-0",
                        selectedCardIdx === i &&
                          "opacity-100 ring-4 ring-blue-600",
                        selectedCardIdx &&
                          selectedCardIdx !== i &&
                          "bg-black/40 opacity-100",
                      )}
                    />
                  </button>
                )}
              />
            </div>
          </div>
          <TransparentAlertDialogFooter>
            <Button
              type="button"
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() =>
                selectedCardIdx !== null && handleSelect(selectedCardIdx)
              }
              disabled={selectedCardIdx === null}
            >
              <H3>Confirm</H3>
            </Button>
          </TransparentAlertDialogFooter>
          {open && show && (
            <div className="relative inset-0 h-full w-full">
              <Button
                type="button"
                variant={"secondary"}
                size={"lg"}
                className="absolute bottom-3 left-3 z-50 text-2xl"
                onClick={() => setShow((prev) => !prev)}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </div>
          )}
        </TransparentAlertDialogContent>
      </TransparentAlertDialog>
      {open && !show && (
        <div className="relative inset-0 h-full w-full">
          <Button
            type="button"
            variant={"secondary"}
            size={"lg"}
            className="absolute bottom-3 left-3 z-50 text-2xl"
            onClick={() => setShow((prev) => !prev)}
          >
            {show ? "Hide" : "Show"}
          </Button>
        </div>
      )}
    </LayoutGroup>
  );
}
interface PickCardContextProps {
  isDialogOpen: boolean;
  handSize: number;
  handleCardSelect(cardIdx: number): void;
  handleCancel(): void;
}
const PickCardContext = createContext<PickCardContextProps | null>(null);
interface PickCardProviderProps {
  children: ReactNode;
}
export function PickCardProvider({ children }: PickCardProviderProps) {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [handSize, setHandSize] = useState<number>(0);

  const onCancelChange = useCancelDialog();
  onCancelChange((val) => {
    setIsDialogOpen(false);
  });

  function handleCardSelect(cardIdx: number) {
    const response: PickCardResponse = {
      selectedCardIndex: cardIdx,
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

  function onCardSelection(cards: number) {
    setHandSize(cards);
    setIsDialogOpen(true);
  }

  useEffect(() => {
    socket.on(GAME_REQUESTS.PICK_CARD, (data: PickCardRequest) => {
      onCardSelection(data.handSize);
    });

    return () => {
      socket.off(GAME_REQUESTS.PICK_CARD);
    };
  }, [gameId]);

  return (
    <PickCardContext.Provider
      value={{
        isDialogOpen,
        handSize,
        handleCardSelect,
        handleCancel,
      }}
    >
      {children}
    </PickCardContext.Provider>
  );
}

export function usePickCard() {
  const giveCardCtx = useContext(PickCardContext);
  if (!giveCardCtx) {
    throw new Error("useGiveCard can only be used inside a GiveCard provider");
  }

  return giveCardCtx;
}
