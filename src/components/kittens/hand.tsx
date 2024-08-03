import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import {
  KittenCard,
  KittenCardCard,
  KittenCardSkeleton,
  useDndIsReallyActiveId,
} from "./card";
import { useUser } from "../user-context";
import { useGiveCard } from "../give-cards-dialog";

interface HandProps {
  cards: BaseCardJSON[];
}

export function Hand(props: HandProps) {
  const { isDialogOpen: isGiveCardOpen } = useGiveCard();
  const ref = useRef<HTMLDivElement | null>(null);
  const [handWidth, setHandWidth] = useState(0);
  const virtualFanWidth = Math.min(handWidth, props.cards.length * 200);
  const virtualFanHeight = virtualFanWidth * 0.75;
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredCardPosition, setHoveredCardPosition] = useState({
    x: 0,
    y: 0,
  });
  const isDragActive = useDndIsReallyActiveId(hoveredCardId || "");
  const { user } = useUser();

  useEffect(() => {
    const onResize = () => setHandWidth(ref.current!.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isDragActive) {
      setHoveredCardId(null);
    }
  }, [isDragActive]);

  function angle(i: number) {
    const factor = props.cards.length / 4;
    let x = offsetFromCenter(props.cards, i) * 0.05;
    if (props.cards.length % 2 === 0) x += 0.03;
    return x * (Math.PI / factor);
  }

  const hoveredCard = props.cards.find((c) => c.cardId === hoveredCardId)!;

  return (
    <div
      ref={ref}
      className="relative flex h-full max-h-card-height w-full justify-center"
    >
      {props.cards.map((card, i) => {
        const padding = 40;
        const isHovered = hoveredCardId === card.cardId;

        const x =
          (isHovered ? Math.sin(angle(i)) * padding : 0) +
          virtualFanWidth * Math.sin(angle(i));
        const y =
          (isHovered ? -Math.cos(angle(i)) * padding : 0) +
          virtualFanHeight * (1 - Math.cos(angle(i)));
        const animate = {
          x,
          y,
          rotate: `${angle(i)}rad`,

          opacity: isHovered ? 0 : 1,
        };

        return (
          <motion.div
            className="absolute cursor-pointer"
            key={card.cardId}
            layout={false}
            style={{ transformOrigin: "center bottom" }}
            animate={animate}
            exit={"hidden"}
            transition={{ duration: isHovered ? 0.1 : 0.3 }}
            onHoverStart={() => {
              setHoveredCardId(card.cardId);
              setHoveredCardPosition({ x, y });
            }}
            onHoverEnd={() => setHoveredCardId(null)}
          >
            <KittenCard card={card} />
          </motion.div>
        );
      })}

      {/* Preview layer */}

      {!isGiveCardOpen && (
        <LayoutGroup>
          <AnimatePresence key={"preview-card-" + hoveredCardId}>
            {hoveredCardId && hoveredCard && !isDragActive && (
              <motion.div
                key={hoveredCard.cardId}
                initial={{
                  x: hoveredCardPosition.x,
                  y: -20,
                }}
                animate={{
                  scale: 1.5,
                  x: hoveredCardPosition.x,
                  y: -150,
                }}
                exit={{
                  opacity: 0,
                  x: hoveredCardPosition.x,
                  y: -50,
                }}
                transition={{ duration: 0.1 }}
                className="pointer-events-none absolute"
                style={{ zIndex: 10 }}
              >
                <KittenCardSkeleton card={hoveredCard} disabled={true} />
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      )}
    </div>
  );
}

function offsetFromCenter<T>(array: T[], index: number): number {
  return index - Math.floor(array.length / 2);
}
