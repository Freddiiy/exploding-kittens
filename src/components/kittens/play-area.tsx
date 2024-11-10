import { useUser } from "../user-context";
import { cn } from "@/lib/utils";
import { H2 } from "../ui/typography";
import { KittenCardBackface, KittenCardCard } from "./card";
import { drawCard, playCard as playCards } from "@/lib/actions";
import { useGame } from "../game-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { NopeTimer, useNopeTimer } from "./auto-nope";
import { SelectCardDialog } from "../select-combo-dialog";
import { Button } from "../ui/button";

export function PlayArea() {
  const { gameState, playerState, lastPlayedCard } = useGame();
  const [playedCardId, setPlayedCardId] = useState<string | null>(null);
  const [isSelectCardsDialogOpen, setSelectCardsDialogOpen] = useState(false);
  function getAvailableCards(playedCardId: string) {
    return (
      playerState?.playerHandOfCards
        .filter(
          (card) =>
            playerState.playerHandOfCards.find(
              (card) => card.cardId === playedCardId,
            )?.type === card.type,
        )
        .filter((x) => playedCardId !== x.cardId) ?? []
    );
  }

  const { user } = useUser();
  const { canBeNoped } = useNopeTimer();

  return (
    <div className="mx-auto">
      <div className="flex flex-col items-end justify-center gap-4">
        <motion.div>
          <div className="flex transform-none items-start justify-center gap-8">
            <div
              className={cn(
                "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-primary transition-all duration-300",
              )}
            >
              {gameState?.discardPile.map((card) => (
                <motion.div
                  layoutId={card.cardId}
                  key={card.cardId}
                  className="absolute inset-0"
                >
                  <KittenCardCard card={card} />
                </motion.div>
              ))}
              {lastPlayedCard && <KittenCardCard card={lastPlayedCard} />}
              <motion.div
                className="pointer-events-none absolute inset-0"
                layout={false}
              ></motion.div>
              <H2 className="text-4xl group-[.is-over]:text-green-600">
                Discard pile
              </H2>
            </div>

            <button
              className={cn(
                "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-primary transition-all duration-300",
              )}
            >
              <motion.div className="pointer-events-none absolute inset-0">
                {(gameState?.deckSize ?? 0) > 0 && <KittenCardBackface />}
              </motion.div>
              <motion.button
                className="absolute inset-0"
                onClick={() => {
                  if (gameState) {
                    drawCard(gameState?.id, user.userId);
                  }
                }}
              >
                {(gameState?.deckSize ?? 0) > 0 ? (
                  <motion.div layoutId={lastPlayedCard?.cardId}>
                    {lastPlayedCard ? (
                      <KittenCardCard card={lastPlayedCard} />
                    ) : (
                      <KittenCardBackface />
                    )}
                  </motion.div>
                ) : null}
              </motion.button>
              <H2 className="text-4xl group-[.is-over]:text-green-600">
                Draw pile
              </H2>
            </button>
          </div>
        </motion.div>
        <div className="h-12 w-full">
          <AnimatePresence>
            {canBeNoped && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, height: 0, scale: 0.85, y: -20 }}
                animate={{ opacity: 1, height: "auto", scale: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NopeTimer />
              </motion.div>
            )}
            {!canBeNoped && playerState?.isPlayersTurn && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, height: 0, scale: 0.85, y: -20 }}
                animate={{ opacity: 1, height: "auto", scale: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="button"
                  size={"lg"}
                  className="w-full"
                  onClick={() => {
                    if (gameState?.id) drawCard(gameState?.id, user.userId);
                  }}
                >
                  DRAW CARD
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SelectCardDialog
        open={isSelectCardsDialogOpen}
        onOpenChange={setSelectCardsDialogOpen}
        cards={getAvailableCards(playedCardId ?? "")}
        onConfirm={(cardIds) => {
          const gameId = gameState?.id;
          const parentCardId = playedCardId;
          if (gameId && parentCardId) {
            playCards(gameId, user.userId, [parentCardId, ...(cardIds ?? [])]);
            setPlayedCardId(null);
            setSelectCardsDialogOpen(false);
          }
        }}
        onCancel={() => {
          setPlayedCardId(null);
          setSelectCardsDialogOpen(false);
        }}
      />
    </div>
  );
}
