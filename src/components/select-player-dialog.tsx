"use client";

import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertDialogContent } from "@radix-ui/react-alert-dialog";
import { PlayerAvatar } from "./game-avatar";
import { type PlayerClient } from "@/services/GameService";
import { Button } from "./ui/button";
import { useState } from "react";
import { H3 } from "./ui/typography";
import { createRoot } from "react-dom/client";
import React from "react";

interface PlayerSelectionDialogProps {
  availablePlayers: PlayerClient[];
  onSelect: (selectedPlayerId: string) => void;
  onCancel?: () => void;
}

export function PlayerSelectionDialog({
  availablePlayers,
  onSelect,
  onCancel,
}: PlayerSelectionDialogProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  function handleSelect(selectedPlayerId: string) {
    onSelect(selectedPlayerId);
  }

  return (
    <AlertDialog open>
      <AlertDialogHeader>
        <AlertDialogTitle>Choose a player</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogContent>
        <div className="flex items-center justify-center gap-4">
          {availablePlayers.map((player) => (
            <Button
              type="button"
              variant={"ghost"}
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
            >
              <PlayerAvatar user={player} />
            </Button>
          ))}
        </div>
        <div>
          <Button
            type="button"
            size={"lg"}
            className="w-full"
            onClick={() => handleSelect(selectedPlayerId)}
            disabled={!selectedPlayerId}
          >
            <H3>Confirm</H3>
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function showPlayerSelectionDialog(
  availablePlayers: PlayerClient[],
): Promise<string> {
  return new Promise((resolve, reject) => {
    const dialogRoot = document.createElement("div");
    document.body.appendChild(dialogRoot);

    const root = createRoot(dialogRoot);

    const closeDialog = () => {
      root.unmount();
      document.body.removeChild(dialogRoot);
    };

    const handleSelect = (selectedPlayerId: string) => {
      closeDialog();
      resolve(selectedPlayerId);
    };

    const handleCancel = () => {
      closeDialog();
      reject(new Error("Player selection cancelled"));
    };

    root.render(
      <PlayerSelectionDialog
        availablePlayers={availablePlayers}
        onSelect={handleSelect}
        onCancel={handleCancel}
      />,
    );
  });
}
