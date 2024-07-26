import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { KittenCard, KittenCardCard, useDndIsReallyActiveId } from "./card";

interface HandProps {
  cards: BaseCardJSON[];
}

export function Hand(props: HandProps) {
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

  useEffect(() => {
    const onResize = () => setHandWidth(ref.current!.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setHoveredCardId(null);
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
      <div className="absolute left-0 top-0 text-4xl">
        {hoveredCardId ?? "none hovered"}
      </div>
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
          rotate: isHovered ? 0 : `${angle(i)}rad`,

          opacity: isHovered ? 0 : 1,
        };

        return (
          <motion.div
            className="absolute cursor-pointer"
            key={card.cardId}
            style={{ transformOrigin: "center bottom" }}
            animate={animate}
            transition={{ duration: 0.1 }}
            onHoverStart={() => {
              setHoveredCardId(card.cardId);
              setHoveredCardPosition({ x, y });
            }}
            onHoverEnd={() => setHoveredCardId(null)}
            onMouseEnter={() => {
              setHoveredCardId(card.cardId);
              setHoveredCardPosition({ x, y });
            }}
            onMouseLeave={() => setHoveredCardId(null)}
          >
            <KittenCard card={card} />
          </motion.div>
        );
      })}
      {/* Preview layer */}
      <AnimatePresence>
        {hoveredCardId && !isDragActive && (
          <motion.div
            initial={{
              x: hoveredCardPosition.x,
              y: -20,
            }}
            animate={{
              scale: 1.5,
              x: hoveredCardPosition.x,
              y: -170,
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
            <div>{hoveredCardId}</div>
            <KittenCardCard card={hoveredCard} disabled={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function offsetFromCenter<T>(array: T[], index: number): number {
  return index - Math.floor(array.length / 2);
}
