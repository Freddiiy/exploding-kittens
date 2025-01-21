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
import Loader from "@/components/loader";
import { PickCardDialog, usePickCard } from "@/components/pick-card-dialog";
import {
  InsertDefuseDialog,
  useInsertDefuse as useInsertDefuse,
} from "@/components/insert-position-dialog";
import { BroadcastMessage } from "@/components/broadcast-message";
import { useUser } from "@/components/user-context";
import { PlayerEditor } from "@/components/player-editor";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type PlayerData } from "../../../models/Player";
import { Button } from "@/components/ui/button";

export function GamePlay() {
  const { user } = useUser();
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
  } = useInsertDefuse();

  if (!user.userId || !user.username) {
    return <GamePlayPlayerEditor />;
  }

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
        <BroadcastMessage />
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
        <InsertDefuseDialog
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

function GamePlayPlayerEditor() {
  const { user, setUser } = useUser();
  const form = useForm<{ player: PlayerData }>({
    defaultValues: { player: user },
  });

  const onSubmit: SubmitHandler<{ player: PlayerData }> = async (data) => {
    setUser(data.player);
  };

  return (
    <div className="mx-auto max-w-lg pt-12">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PlayerEditor
          player={form.watch("player")}
          onPlayerChange={(player) => form.setValue("player", player)}
        />
        <Button
          size={"lg"}
          className="w-full"
          disabled={
            !form.watch("player").userId ||
            !form.watch("player.username") ||
            form.watch("player.username").length < 3
          }
        >
          JOIN GAME
        </Button>
      </form>
    </div>
  );
}
