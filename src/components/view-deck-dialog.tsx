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
import { KittenCard, KittenCardCard } from "./kittens/card";
import { LayoutGroup, motion } from "framer-motion";
import {
  type GiveCardResponse,
  GAME_REQUESTS,
} from "@/models/game/RequestManager";
import { socket } from "@/trpc/socket";
import { useGameId, useCancelDialog } from "./game-provider";
import { useNopeTimer } from "./kittens/auto-nope";

interface ViewDeckDialogProps {
  open: boolean;
  cards: BaseCardJSON[];
  onConfirm?: (cardId?: string) => void;
  onCancel?: () => void;
}

export function ViewDeckDialog({
  open,
  cards,
  onConfirm,
  onCancel,
}: ViewDeckDialogProps) {
  const [show, setShow] = useState(true);

  function handleClick() {
    onConfirm?.();
  }

  return (
    <LayoutGroup>
      <TransparentAlertDialog open={open && show}>
        <TransparentAlertDialogContent>
          <TransparentAlertDialogHeader>
            <TransparentAlertDialogTitle>
              View top {cards.length} {cards.length > 1 ? "cards" : "card"} of
              the deck
            </TransparentAlertDialogTitle>
          </TransparentAlertDialogHeader>
          <div className="space-y-4 py-12">
            <div className="flex h-card-height flex-wrap items-center justify-center gap-12">
              {cards.map((card) => (
                <motion.div
                  key={card.cardId}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <KittenCard card={card} />
                </motion.div>
              ))}
            </div>
          </div>
          <TransparentAlertDialogFooter>
            <Button
              type="button"
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() => handleClick()}
            >
              <H3>Return cards</H3>
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
interface ViewDeckContextProps {
  isDialogOpen: boolean;
  cards: BaseCardJSON[];
  handleConfirm(): void;
  handleCancel(): void;
}
const ViewDeckContext = createContext<ViewDeckContextProps | null>(null);
interface GiveCardProviderProps {
  children: ReactNode;
}
export function ViewDeckProvider({ children }: GiveCardProviderProps) {
  const { isTimerCompleted } = useNopeTimer();
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNoped, setIsNoped] = useState(false);
  const [cards, setCards] = useState<BaseCardJSON[]>([]);

  useEffect(() => {
    if (!isNoped && isTimerCompleted && cards.length >= 1) {
      setIsDialogOpen(true);
    }
  }, [cards, isNoped, isTimerCompleted]);

  /* 

  TODO: See The Future thoughts...
  I don't think this should be a cancelable action.
  Maybe it should only be viewable after the nope timer is done?
  Sounds good, but lets wait for feedback.
  */

  const onCancelChange = useCancelDialog();
  onCancelChange(() => {
    setIsNoped(true);
    setIsDialogOpen(false);
  });

  function handleConfirm() {
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE);

    setIsNoped(false);
    setIsDialogOpen(false);
    setCards([]);
  }

  function handleCancel() {
    setIsNoped(false);
    setIsDialogOpen(false);
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, {
      error: "Card selection cancelled",
    });
  }

  async function onViewCards(cards: BaseCardJSON[]) {
    setCards(cards);
  }

  useEffect(() => {
    socket.on(
      GAME_REQUESTS.VIEW_DECK_CARDS,
      async (data: { cards: BaseCardJSON[] }) => {
        setIsNoped(false);
        setIsDialogOpen(false);
        await onViewCards(data.cards);
      },
    );

    return () => {
      socket.off(GAME_REQUESTS.VIEW_DECK_CARDS);
    };
  }, [gameId]);

  return (
    <ViewDeckContext.Provider
      value={{
        isDialogOpen,
        cards,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </ViewDeckContext.Provider>
  );
}

export function useViewDeck() {
  const viewDeckCtx = useContext(ViewDeckContext);
  if (!viewDeckCtx) {
    throw new Error("useViewCard can only be used inside a ViewDeck provider");
  }

  return viewDeckCtx;
}
