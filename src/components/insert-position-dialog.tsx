"use client";

import {
  TransparentAlertDialog,
  TransparentAlertDialogContent,
  TransparentAlertDialogFooter,
  TransparentAlertDialogHeader,
  TransparentAlertDialogTitle,
} from "./ui/transparent-alert-dialog";
import { GAME_ACTIONS } from "@/services/GameService";
import { Button } from "./ui/button";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { H3, H4 } from "./ui/typography";

import React from "react";
import { LayoutGroup } from "framer-motion";
import { GAME_REQUESTS } from "@/models/game/RequestManager";
import { socket } from "@/trpc/socket";
import { useGameId, useCancelDialog } from "./game-provider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { KittenCardBackface } from "./kittens/card";

interface InsertPositionDialogProps {
  open: boolean;
  onOpenChange?(open: boolean): void;
  onConfirm?: (postion: (typeof options)[number]) => void;
  onCancel?: () => void;
}

const options = [
  "Top",
  "Second",
  "Third",
  "Forth",
  "Fifth",
  "Bottom",
  "Random",
] as const;

export function InsertPositionDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: InsertPositionDialogProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    (typeof options)[number] | null
  >(null);

  function handleConfirm() {
    if (selectedPosition) {
      onConfirm?.(selectedPosition);
    }
  }

  function handleSelect(index: (typeof options)[number]) {
    setSelectedPosition(index);
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
              Select where to put in the draw pile
            </TransparentAlertDialogTitle>
          </TransparentAlertDialogHeader>
          <div className="flex items-center justify-center gap-4 space-y-4 py-12">
            <div className="h-card-height w-card-width">
              <KittenCardBackface />
            </div>
            <RadioGroup
              defaultValue="top"
              className="flex w-64 flex-shrink-0 flex-col gap-4 rounded-md"
              value={selectedPosition ?? undefined}
              onValueChange={(val: (typeof options)[number]) =>
                handleSelect(val)
              }
            >
              {options.map((option) => (
                <div key={option}>
                  <RadioGroupItem
                    key={option}
                    value={option}
                    id={option}
                    className="peer sr-only"
                  />

                  <Label
                    htmlFor={option}
                    className="flex h-12 w-full items-center justify-center border-2 border-muted bg-white px-4 py-2 text-black peer-data-[state=checked]:bg-muted-foreground [&:has([data-state=checked])]:border-white"
                  >
                    <H4>{option}</H4>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <TransparentAlertDialogFooter className="flex w-full flex-col">
            <Button
              type="button"
              size={"lg"}
              className="mx-auto w-full max-w-2xl"
              onClick={() => selectedPosition && handleConfirm()}
            >
              <H3>Insert card</H3>
            </Button>
          </TransparentAlertDialogFooter>
        </TransparentAlertDialogContent>
      </TransparentAlertDialog>
    </LayoutGroup>
  );
}
interface InsertPositionContextProps {
  isDialogOpen: boolean;
  handleConfirm(): void;
  handleCancel(): void;
}
const InsertPositionContext = createContext<InsertPositionContextProps | null>(
  null,
);
interface InsertPositionProviderProps {
  children: ReactNode;
}
export function InsertPositionProvider({
  children,
}: InsertPositionProviderProps) {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /* 
  
    TODO: See The Future thoughts...
    I don't think this should be a cancelable action.
    Maybe it should only be viewable after the nope timer is done?
    Sounds good, but lets wait for feedback.
    */

  const onCancelChange = useCancelDialog();
  onCancelChange(() => {
    setIsDialogOpen(false);
  });

  function handleConfirm() {
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE);

    setIsDialogOpen(false);
  }

  function handleCancel() {
    setIsDialogOpen(false);
    socket.emit(GAME_ACTIONS.CLIENT_RESPONSE, {
      error: "Card selection cancelled",
    });
  }

  useEffect(() => {
    socket.on(GAME_REQUESTS.INSERT_CARD, async () => {
      setIsDialogOpen(true);
    });

    return () => {
      socket.off(GAME_REQUESTS.VIEW_DECK_CARDS);
    };
  }, [gameId]);

  return (
    <InsertPositionContext.Provider
      value={{
        isDialogOpen,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </InsertPositionContext.Provider>
  );
}

export function useInsertPosition() {
  const viewDeckCtx = useContext(InsertPositionContext);
  if (!viewDeckCtx) {
    throw new Error("useViewCard can only be used inside a ViewDeck provider");
  }

  return viewDeckCtx;
}
