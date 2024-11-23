"use client";
import {
  type ChoosePlayerResponse,
  GAME_REQUESTS,
} from "@/models/game/RequestManager";
import { type PlayerClient, GAME_ACTIONS } from "@/services/GameService";
import { socket } from "@/trpc/socket";
import { useState, useEffect } from "react";
import { useGameId, useCancelDialog } from "./game-provider";

export function usePlayerSelection() {
  const gameId = useGameId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerClient[]>([]);
  const onCancelChange = useCancelDialog();
  onCancelChange((val) => {
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
