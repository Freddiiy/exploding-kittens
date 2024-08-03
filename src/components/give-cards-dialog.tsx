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
import { KittenCardCard } from "./kittens/card";
import { LayoutGroup, motion } from "framer-motion";
import {
  type GiveCardResponse,
  GAME_REQUESTS,
} from "@/models/game/RequestManager";
import { socket } from "@/trpc/socket";
import { useGameId, useCancelDialog } from "./game-provider";

interface GiveCardDialogProps {
  open: boolean;
  availableCards: BaseCardJSON[];
  onSelect: (selectedCardId: string) => void;
  onCancel?: () => void;
}

export function GiveCardDialog({
  open,
  availableCards: cards,
  onSelect,
  onCancel,
}: GiveCardDialogProps) {
  const [show, setShow] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  function handleSelect(selectedCardId: string) {
    onSelect(selectedCardId);
    setSelectedCardId("");
  }

  return (
    <LayoutGroup>
      <TransparentAlertDialog open={open && show}>
        <TransparentAlertDialogContent>
          <TransparentAlertDialogHeader>
            <TransparentAlertDialogTitle>
              Choose a card to give
            </TransparentAlertDialogTitle>
          </TransparentAlertDialogHeader>
          <div className="space-y-4 py-12">
            <div className="flex h-card-height items-center justify-center gap-4">
              <HandContainer
                items={cards}
                render={(item) => (
                  <button
                    className="relative h-full w-full"
                    onClick={() => setSelectedCardId(item.cardId)}
                  >
                    <KittenCardCard card={item} />
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg opacity-0 transition-all duration-150",
                        !selectedCardId && "opacity-0",
                        selectedCardId === item.cardId &&
                          "opacity-100 ring-4 ring-blue-600",
                        selectedCardId &&
                          selectedCardId !== item.cardId &&
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
              onClick={() => handleSelect(selectedCardId)}
              disabled={!selectedCardId}
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
interface GiveCardContextProps {
  isDialogOpen: boolean;
  availableCards: BaseCardJSON[];
  handleCardSelect(cardId: string): void;
  handleCancel(): void;
}
const GiveCardContext = createContext<GiveCardContextProps | null>(null);
interface GiveCardProviderProps {
  children: ReactNode;
}
export function GiveCardProvider({ children }: GiveCardProviderProps) {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableCards, setAvailableCards] = useState<BaseCardJSON[]>([]);

  const onCancelChange = useCancelDialog();
  onCancelChange((val) => {
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
