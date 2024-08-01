"use client";

import {
  useGame,
  useGiveCard,
  usePlayerSelection,
} from "@/components/game-provider";
import { Lobby } from "./lobby";
import { Board } from "@/components/kittens/board";
import { PlayerSelectionDialog } from "@/components/select-player-dialog";
import { GiveCardDialog } from "@/components/give-cards-dialog";

export function GamePlay() {
  const { gameState, gameStatus } = useGame();
  const {
    isDialogOpen: isPlayerSelectionOpen,
    availablePlayers,
    handlePlayerSelect,
    handleCancel: handleCancelPlayerSelect,
  } = usePlayerSelection();
  const {
    isDialogOpen: isGiveCardOpen,
    availableCards,
    handleCardSelect: handleGiveCardSelect,
    handleCancel: handleCancelGiveCard,
  } = useGiveCard();

  if (gameStatus === "notFound") {
    return <div>Game not found</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  if (gameStatus === "waiting") {
    return <Lobby />;
  }

  return (
    <>
      <Board />
      <PlayerSelectionDialog
        open={isPlayerSelectionOpen}
        availablePlayers={availablePlayers}
        onSelect={handlePlayerSelect}
        onCancel={handleCancelPlayerSelect}
      />
      <GiveCardDialog
        open={isGiveCardOpen}
        availableCards={availableCards}
        onSelect={handleGiveCardSelect}
        onCancel={handleCancelGiveCard}
      />
    </>
  );
}
