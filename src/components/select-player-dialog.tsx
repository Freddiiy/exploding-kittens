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

interface PlayerSelectionDialogProps {
  open: boolean;
  availablePlayers: PlayerClient[];
  onSelect: (selectedPlayerId: string) => void;
  onCancel?: () => void;
}

export function PlayerSelectionDialog({
  open,
  availablePlayers,
  onSelect,
  onCancel,
}: PlayerSelectionDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [show, setShow] = useState(true);
  function handleSelect(selectedPlayerId: string) {
    onSelect(selectedPlayerId);
    setSelectedPlayerId("");
  }

  return (
    <AlertDialog
      open={open && show}
      onOpenChange={(val) => {
        if (!val) setShow(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Choose a player</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="flex h-full items-center justify-center gap-4">
            {availablePlayers.map((player) => (
              <Button
                type="button"
                variant={"ghost"}
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={cn("h-full")}
              >
                <PlayerAvatar
                  user={player}
                  selected={selectedPlayerId === player.id}
                />
              </Button>
            ))}
          </div>
        </div>
        <AlertDialogFooter>
          <Button
            type="button"
            size={"lg"}
            className="w-full"
            onClick={() => handleSelect(selectedPlayerId)}
            disabled={!selectedPlayerId}
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
    </AlertDialog>
  );
}
