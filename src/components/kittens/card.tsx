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
  className?: string;
}

export function KittenCard({
  card,
  disabled = false,
  className,
}: KittenCardFullProps) {
  const isDragActive = useDndIsReallyActiveId(card.cardId);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.cardId,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragActive ? 0 : 1,
  };

  return (
    <div>
      <div {...attributes} {...listeners} style={style} ref={setNodeRef}>
        <KittenCardCard card={card} disabled={disabled} />
      </div>

      <KittenCardDragOverlay card={card}>
        <div style={{ opacity: isDragActive ? 1 : 0 }}>
          <KittenCardCard card={card} />
        </div>
      </KittenCardDragOverlay>
    </div>
  );
}

export function KittenCardCard({ card, disabled }: KittenCardFullProps) {
  const controls = useAnimation();
  const isDragActive = useDndIsReallyActiveId(card.cardId);

  useEffect(() => {
    if (isDragActive) {
      controls.start({ y: 0, scale: 1 });
    }
  }, [isDragActive, controls]);

  return (
    <motion.div
      animate={controls}
      transition={{ duration: 0.1 }}
      whileHover={{ scale: 1.2 }}
    >
      <KittenCardSkeleton card={card} disabled={disabled} />
    </motion.div>
  );
}

export function KittenCardSkeleton({ card, disabled }: KittenCardFullProps) {
  return (
    <KittenCardContext.Provider value={{ card: card, disabled }}>
      <div className="pointer-events-none relative h-card-height w-card-width">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border-2 border-black bg-foreground">
          <KittenCardHeader />

          <div className="relative m-2 min-h-[60%] flex-grow">
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
          </div>
          <KittenCardHeader flipped />
        </div>
      </div>
    </KittenCardContext.Provider>
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
    <DragOverlay>{active ? children : null}</DragOverlay>,
    document.body,
  );
}

interface KittenCardHeaderProps {
  flipped?: boolean;
}
function KittenCardHeader({ flipped }: KittenCardHeaderProps) {
  const cardCtx = useKittenCard();
  return (
    <div className={cn("flex gap-2", flipped && "rotate-180")}>
      <div className="relative m-2 flex-shrink-0 p-0.5">
        <Image
          src={"/characters/angry_devil_cat.png"}
          alt="icon"
          height={40}
          width={40}
          className="aspect-square rounded-full"
        />
      </div>
      <div className={cn("flex flex-col", flipped && "justify-center")}>
        <h3 className="text-xl font-medium uppercase tracking-normal text-black">
          {cardCtx.card.name}
        </h3>
        {!flipped && (
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

export function CardPreview({
  hoveredCardId,
  hoveredCardPosition,
  card,
}: PreviewProps) {
  return createPortal(
    <AnimatePresence>
      {hoveredCardId && card && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            x: hoveredCardPosition.x,
            y: hoveredCardPosition.y,
          }}
          animate={{
            opacity: 1,
            scale: 2,
            x: hoveredCardPosition.x,
            y: hoveredCardPosition.y - 200,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            x: hoveredCardPosition.x,
            y: hoveredCardPosition.y,
          }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed"
          style={{ zIndex: 9999 }}
        >
          <div>{hoveredCardId}</div>
          <KittenCardCard card={card} disabled={true} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
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
