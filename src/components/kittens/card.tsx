"use client";

import { cn } from "@/lib/utils";
import { type CardType } from "@/models/cards/_CardType";
import Image from "next/image";
import {
  type ReactNode,
  act,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useDndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Artifika } from "next/font/google";
import { createPortal } from "react-dom";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { explodingKittenCharacters } from "@/models/characters";
import { P } from "../ui/typography";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useGame } from "../game-provider";

interface KittenCardProps {
  cardId: string;
  type: CardType;
  name: string;
  description: string;
  mechanics: string;
}

interface KittenCardFullProps {
  card: KittenCardProps;
  disabled?: boolean;
  flipped?: boolean;

  className?: string;
}

export function KittenCard({
  card,
  disabled = false,
  flipped = false,
  dragDisabled = false,
  className,
}: KittenCardFullProps & { dragDisabled?: boolean }) {
  return (
    <div>
      <motion.div>
        <KittenCardCard
          className={className}
          card={card}
          disabled={disabled}
          flipped={flipped}
        />
      </motion.div>
    </div>
  );
}

export function KittenCardCard({
  card,
  disabled = false,
  flipped = false,
}: KittenCardFullProps) {
  const controls = useAnimation();

  const { gameState } = useGame();

  return (
    <motion.div
      animate={controls}
      layoutId={"player-" + gameState?.currentPlayerId + "card-" + card.cardId}
    >
      <KittenCardSkeleton card={card} disabled={disabled} flipped={flipped} />
    </motion.div>
  );
}

export function KittenCardSkeleton({
  card,
  disabled = false,
  flipped = false,
}: KittenCardFullProps) {
  const [isFlipped, setIsFlipped] = useState(flipped);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  useEffect(() => {
    if (isFlipped !== flipped) {
      setIsFlipped(flipped);
      setShouldAnimate(true);
    }
  }, [flipped]);

  return (
    <KittenCardContext.Provider
      value={{ card: card, disabled, flipped: flipped }}
    >
      <motion.div
        className={cn("relative h-card-height w-card-width")}
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: flipped ? 180 : 0 }}
        animate={shouldAnimate && { rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          <KittenCardContent />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ backfaceVisibility: "hidden", transform: `rotateY(180deg)` }}
        >
          <KittenCardBackface />
        </motion.div>
      </motion.div>
    </KittenCardContext.Provider>
  );
}

export function KittenCardContent() {
  const { card } = useKittenCard();
  return (
    <div className="flex h-card-height w-card-width flex-col overflow-hidden rounded-xl border-2 border-black bg-white">
      <KittenCardHeader />
      <div className="relative m-2 min-h-[60%] flex-grow overflow-hidden rounded-lg">
        <Image
          src={
            explodingKittenCharacters.find(
              (x) => x.name.toLowerCase() === "angry devil cat",
            )!.img
          }
          alt={card.name}
          layout="fill"
          objectFit="cover"
        />
        <div className="justify-centerpx-4 absolute inset-x-0 bottom-4 mx-auto flex w-full px-2">
          <div className="rounded-xl bg-muted/80 p-2">
            <P className="text-xs text-white">{card.mechanics}</P>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KittenCardBackface() {
  return (
    <div className="flex h-card-height w-card-width flex-col items-center justify-center -space-y-2 overflow-hidden rounded-xl bg-gradient-to-t from-red-950 to-red-700">
      <h2 className="text-4xl font-bold">
        <span className="text-clip bg-gradient-to-t from-red-800 via-red-500 to-yellow-300 bg-clip-text text-transparent">
          EXPLODING
        </span>
      </h2>
      <h2 className="text-5xl font-bold text-white">KITTENS</h2>
    </div>
  );
}

interface KittenCardHeaderProps {
  flipped?: boolean;
}
function KittenCardHeader({ flipped }: KittenCardHeaderProps) {
  const cardCtx = useKittenCard();
  return (
    <div className={cn("flex", flipped && "rotate-180")}>
      <div className="relative m-2 flex-shrink-0 p-0.5">
        <Image
          src={"/characters/angry_devil_cat.png"}
          alt="icon"
          height={30}
          width={30}
          className="aspect-square rounded-full"
        />
      </div>
      <div className={cn("flex flex-col pt-1", flipped && "justify-center")}>
        <h3 className="text-xl font-medium uppercase tracking-normal text-black">
          {cardCtx.card.name}
        </h3>
        {!flipped && cardCtx.card.description && false && (
          <p className="text-xs font-thin uppercase leading-tight tracking-wide text-muted-foreground">
            {cardCtx.card.description}
          </p>
        )}
      </div>
    </div>
  );
}

interface PreviewProps {
  hoveredCardId: string | null;
  hoveredCardPosition: { x: number; y: number };
  card: BaseCardJSON | undefined;
}

const KittenCardContext = createContext<KittenCardFullProps | null>(null);

function useKittenCard() {
  const kittenCardCtx = useContext(KittenCardContext);
  if (!kittenCardCtx) {
    throw new Error(
      "Kitten context must be used inside <KittenCard></KittenCard>",
    );
  }

  return kittenCardCtx;
}

export function canComboWith(card: BaseCardJSON, otherCard: BaseCardJSON) {
  if (card.cardId === otherCard.cardId) {
    return true;
  }
  // If either card is not a cat card, they can't combo
  if (!card.isCatCard || !otherCard.isCatCard) {
    return false;
  }

  // If either card doesn't have a combo type, they can't combo
  if (!card.comboType || !otherCard.comboType) {
    return false;
  }

  // Cards can combo if they have the same combo type
  return card.comboType === otherCard.comboType;
}
export function canComboWithArray(card: BaseCardJSON, cards: BaseCardJSON[]) {
  // Base case: if no cards to check, return false
  if (cards.length === 0) {
    return false;
  }

  // Check each card in the array using the original canComboWith function
  return cards.some((otherCard) =>
    // Skip checking against itself
    canComboWith(card, otherCard),
  );
}

export function canPlayCards(cards: BaseCardJSON[]) {
  if (cards.length === 0) {
    return false;
  }

  if (cards.every((x) => canComboWithArray(x, cards) && x.isCatCard)) {
    return cards.length > 1 && cards.length <= 3;
  } else {
    return cards.length === 1;
  }
}
