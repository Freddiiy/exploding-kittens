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
  Dispatch,
  SetStateAction,
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
import { KittenCard, KittenCardCard } from "./kittens/card";
import { LayoutGroup, motion } from "framer-motion";
import {
  type GiveCardResponse,
  GAME_REQUESTS,
} from "@/models/game/RequestManager";
import { socket } from "@/trpc/socket";
import { useGameId, useCancelDialog, useGame } from "./game-provider";
import { useNopeTimer } from "./kittens/auto-nope";

interface ViewDeckDialogProps {
  open: boolean;
  onOpenChange?(open: boolean): void;
  cards: BaseCardJSON[];
  onConfirm?: (cardIds?: string[]) => void;
  onCancel?: () => void;
}

export function SelectCardDialog({
  open,
  onOpenChange,
  cards,
  onConfirm,
  onCancel,
}: ViewDeckDialogProps) {
  const [selectedCardId, setSelectedCardId] = useState<string[]>([]);

  function handleConfirm() {
    onConfirm?.(selectedCardId);
  }

  function handleSelect(cardId: string) {
    if (selectedCardId.includes(cardId)) {
      setSelectedCardId((prev) => prev.filter((_cardId) => _cardId !== cardId));
    } else {
      if (selectedCardId.length < 2) {
        setSelectedCardId((prev) => prev.concat(cardId));
      }
    }
  }

  return (
    <LayoutGroup>
      <TransparentAlertDialog
        open={open}
        onOpenChange={(val) => {
          if (!val) {
            onCancel?.();
          }
          onOpenChange?.(val);
        }}
      >
        <TransparentAlertDialogContent>
          <TransparentAlertDialogHeader>
            <TransparentAlertDialogTitle>
              Select extra cards to play
            </TransparentAlertDialogTitle>
          </TransparentAlertDialogHeader>
          <div className="space-y-4 py-12">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {cards.map((card) => (
                <motion.button
                  key={card.cardId}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleSelect(card.cardId)}
                  className="relative h-card-height w-card-width"
                >
                  <KittenCardCard card={card} />
                  <div
                    className={cn(
                      "absolute inset-0 rounded-lg opacity-0 transition-all duration-150",
                      selectedCardId.length === 0 && "opacity-0",
                      selectedCardId.includes(card.cardId) &&
                        "opacity-100 ring-4 ring-blue-600",
                    )}
                  />
                </motion.button>
              ))}
            </div>
          </div>
          <TransparentAlertDialogFooter className="flex w-full flex-col">
            <Button
              type="button"
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() => handleConfirm()}
            >
              <H3>Select cards</H3>
            </Button>
            <Button
              type="button"
              variant={"secondary"}
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() => onCancel?.()}
            >
              Cancel
            </Button>
          </TransparentAlertDialogFooter>
        </TransparentAlertDialogContent>
      </TransparentAlertDialog>
    </LayoutGroup>
  );
}
interface ViewDeckContextProps {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
  cards: BaseCardJSON[];
  handleConfirm(): void;
  handleCancel(): void;
}
const ViewDeckContext = createContext<ViewDeckContextProps | null>(null);
interface GiveCardProviderProps {
  children: ReactNode;
}

export function useSelectCards() {
  const selectCardsCtx = useContext(ViewDeckContext);
  if (!selectCardsCtx) {
    throw new Error(
      "useSelectCards can only be used inside a ViewSelectCards provider",
    );
  }

  return selectCardsCtx;
}
