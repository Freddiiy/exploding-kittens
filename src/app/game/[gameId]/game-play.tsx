"use client";

import { useGame } from "@/components/game-provider";
import { GiveCardDialog, useGiveCard } from "@/components/give-cards-dialog";
import { usePlayerSelection } from "@/components/usePlayerSelection";
import { Lobby } from "./lobby";
import { Board } from "@/components/kittens/board";
import { PlayerSelectionDialog } from "@/components/select-player-dialog";

import { H2 } from "@/components/ui/typography";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useViewDeck, ViewDeckDialog } from "@/components/view-deck-dialog";
import { Yusei_Magic } from "next/font/google";
import Loader from "@/components/loader";
import { PickCardDialog, usePickCard } from "@/components/pick-card-dialog";
import {
  InsertPositionDialog,
  InsertPositionProvider,
  useInsertPosition,
} from "@/components/insert-position-dialog";

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

  const {
    isDialogOpen: isPickCardOpen,
    handSize: pickCardHandSize,
    handleCardSelect: handlePickCard,
    handleCancel: handleCencelPickCard,
  } = usePickCard();

  const {
    isDialogOpen: isViewDeckOpen,
    cards: topCards,
    handleConfirm: handleConfirmViewDeck,
    handleCancel: handleCencelViewDeck,
  } = useViewDeck();

  const {
    isDialogOpen: isInsertOpen,
    handleConfirm: handleInsertConfirm,
    handleCancel: handleInsertCancel,
  } = useInsertPosition();

  if (gameStatus === "notFound") {
    return <div>Game not found</div>;
  }

  if (!gameState) {
    return (
      <div className="flex h-screen max-h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (gameStatus === "waiting") {
    return <Lobby />;
  }

  if (gameStatus === "inProgress") {
    return (
      <>
        <YourTurnBroadcast />
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
        <PickCardDialog
          open={isPickCardOpen}
          amountOfCards={pickCardHandSize}
          onSelect={handlePickCard}
          onCancel={handleCencelPickCard}
        />
        <ViewDeckDialog
          open={isViewDeckOpen}
          cards={topCards}
          onConfirm={handleConfirmViewDeck}
          onCancel={handleCencelViewDeck}
        />
        <InsertPositionDialog
          open={isInsertOpen}
          onConfirm={handleInsertConfirm}
          onCancel={handleInsertCancel}
        />
      </>
    );
  }
}

function YourTurnBroadcast() {
  const { playerState } = useGame();
  const controls = useAnimation();
  const yourTurn = playerState?.isPlayersTurn;

  useEffect(() => {
    if (yourTurn) {
      controls
        .start({
          scale: 1,
          opacity: 1,
          transition: { duration: 0.1 },
        })
        .then(() => {
          controls.start({
            opacity: 0,
            scale: 1,
            transition: { duration: 0.5, delay: 1 }, // Adjust delay as needed
          });
        });
    }
  }, [yourTurn, controls]);

  return (
    <AnimatePresence>
      {yourTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={controls}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={controls}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <H2 className="text-8xl text-white">Your turn</H2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
