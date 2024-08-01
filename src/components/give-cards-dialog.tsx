"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { PlayerAvatar } from "./game-avatar";
import { type PlayerClient } from "@/services/GameService";
import { Button } from "./ui/button";
import { useState } from "react";
import { H3 } from "./ui/typography";

import React from "react";
import { cn } from "@/lib/utils";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { Hand } from "./kittens/hand";
import { HandContainer } from "./hand-container";
import { KittenCardCard } from "./kittens/card";
import { LayoutGroup, motion } from "framer-motion";

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
      <AlertDialog open={open && show}>
        <AlertDialogContent className="max-w-full border-0 bg-transparent shadow-none">
          <AlertDialogHeader className="items-center text-white">
            <AlertDialogTitle className="text-4xl">
              Choose a card to give
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-12">
            <div className="flex h-card-height items-center justify-center gap-4">
              <HandContainer
                items={cards}
                render={(item) => (
                  <button
                    className={cn("relative h-full w-full")}
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
          <AlertDialogFooter>
            <Button
              type="button"
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() => handleSelect(selectedCardId)}
              disabled={!selectedCardId}
            >
              <H3>Confirm</H3>
            </Button>
          </AlertDialogFooter>
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
        </AlertDialogContent>
      </AlertDialog>
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
