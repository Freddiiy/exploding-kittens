"use client";

import { cn } from "@/lib/utils";
import { CardType } from "@/models/cards/_CardType";
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
import { BaseCardJSON } from "@/models/cards/_BaseCard";
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
  const isDragActive = useDndIsReallyActiveId(card.cardId);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.cardId,
    disabled: dragDisabled || disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragActive ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ opacity: isDragActive ? 0 : 1 }}>
      <motion.div {...attributes} {...listeners} style={style}>
        <KittenCardCard card={card} disabled={disabled} flipped={flipped} />
      </motion.div>

      <KittenCardDragOverlay card={card}>
        <motion.div style={{ opacity: isDragActive ? 1 : 0 }}>
          <KittenCardCard card={card} flipped={flipped} />
        </motion.div>
      </KittenCardDragOverlay>
    </div>
  );
}

export function KittenCardCard({
  card,
  disabled = false,
  flipped = false,
}: KittenCardFullProps) {
  const controls = useAnimation();
  const isDragActive = useDndIsReallyActiveId(card.cardId);
  const { gameState } = useGame();

  useEffect(() => {
    if (isDragActive) {
      controls.start({ y: 0, scale: 1 });
    }
  }, [isDragActive, controls]);

  return (
    <motion.div
      animate={isDragActive ? controls : undefined}
      layoutId={
        !isDragActive
          ? "player-" + gameState?.currentPlayerId + "card-" + card.cardId
          : undefined
      }
      className={cn(isDragActive && "drop-shadow-2xl")}
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
  const isDragActive = useDndIsReallyActiveId(card.cardId);
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
        className={cn(
          "relative h-card-height w-card-width",
          isDragActive && "shadow-2xl",
        )}
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
    <div className="flex h-card-height w-card-width flex-col items-center justify-center -space-y-2 overflow-hidden rounded-xl border-2 border-red-900 bg-red-900">
      <h2 className="text-4xl font-bold">
        <span className="text-clip bg-gradient-to-t from-red-800 via-red-500 to-yellow-300 bg-clip-text text-transparent">
          EXPLODING
        </span>
      </h2>
      <h2 className="text-5xl font-bold text-white">KITTENS</h2>
    </div>
  );
}

interface KittenCardDragOverlayProps extends KittenCardFullProps {
  children: ReactNode;
}
function KittenCardDragOverlay({ card, children }: KittenCardDragOverlayProps) {
  const { active } = useDndContext();
  const isDragActive = useDndIsReallyActiveId(card.cardId);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isDragActive) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Adjust this value to match your animation duration
      return () => clearTimeout(timer);
    }
  }, [isDragActive]);

  if (!isDragActive && !isAnimating) {
    return null;
  }

  return createPortal(
    <DragOverlay modifiers={[snapCenterToCursor]}>
      {active ? children : null}
    </DragOverlay>,
    document.body,
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

export function useDndIsReallyActiveId(id: string) {
  const context = useDndContext();
  const isActive = context.active?.id === id;
  return isActive;
}
