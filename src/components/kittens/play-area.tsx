import {
  UniqueIdentifier,
  useDndContext,
  useDndMonitor,
  useDroppable,
} from "@dnd-kit/core";
import { useUser } from "../user-context";
import { cn } from "@/lib/utils";
import { H2, H3 } from "../ui/typography";
import {
  KittenCard,
  KittenCardBackface,
  KittenCardCard,
  KittenCardSkeleton,
} from "./card";
import { drawCard, playCard } from "@/lib/actions";
import { useGame } from "../game-provider";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Card } from "../ui/card";
import { useState } from "react";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";

export function PlayArea() {
  const { gameState, playerState, lastPlayedCard } = useGame();
  const { setNodeRef: discardRef, isOver: isOverDiscard } = useDroppable({
    id: "discard-pile",
  });

  const { setNodeRef: drawRef, isOver: isOverDraw } = useDroppable({
    id: "draw-pile",
  });

  const [parent, setParent] = useState<UniqueIdentifier | null>(null);

  useDndMonitor({
    onDragEnd(event) {
      const cardId = event.active.id as string;
      if (event.over && event.over.id === "discard-pile") {
        const card = playerState?.playerHandOfCards.find(
          (card) => card.cardId === cardId,
        );
        if (card && gameState?.id) {
          setParent(event.over ? event.over.id : null);
          playCard(gameState.id, user.userId, cardId);
        }
      }
    },
  });

  const { user } = useUser();
  const dndCard = gameState?.discardPile.find(
    (card) => card.cardId === parent?.toString(),
  );

  return (
    <div className="mx-auto">
      <div className="flex transform-none justify-center gap-8">
        <div
          ref={discardRef}
          className={cn(
            "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-primary transition-all duration-300",
            isOverDiscard && "is-over outline-green-600",
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
            layoutId={parent?.toString()}
            key={parent?.toString()}
            className="pointer-events-none absolute inset-0"
            layout={false}
          >
            {dndCard ? <KittenCard card={dndCard} /> : null}
          </motion.div>
          <H2 className="text-4xl group-[.is-over]:text-green-600">
            Discard pile
          </H2>
        </div>

        <button
          ref={drawRef}
          className={cn(
            "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-primary transition-all duration-300",
            isOverDraw && "is-over outline-green-600",
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
    </div>
  );
}
