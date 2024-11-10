import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";

interface HandProps<T> {
  items: T[];
  render(val: T, i: number, arr: T[]): ReactNode;
}

function useCalcHand<T>(arr: T[]) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [handWidth, setHandWidth] = useState(0);
  const virtualFanWidth = Math.min(handWidth, arr.length * 200);
  const virtualFanHeight = virtualFanWidth * 0.75;

  useEffect(() => {
    const onResize = () => setHandWidth(ref.current!.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function angle(i: number) {
    const factor = arr.length / 4;
    let x = offsetFromCenter(arr, i) * 0.05;
    if (arr.length % 2 === 0) x += 0.03;
    return x * (Math.PI / factor);
  }

  return { ref, virtualFanHeight, virtualFanWidth, angle };
}

export function HandContainer<T>(props: HandProps<T>) {
  const { ref, virtualFanHeight, virtualFanWidth, angle } = useCalcHand(
    props.items,
  );
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <LayoutGroup key={"layout Group"}>
      <div
        ref={ref}
        className="relative flex h-full max-h-card-height w-full justify-center"
      >
        {props.items.map((item, i, arr) => {
          const padding = 20;
          const isHovered = hoveredId === i;

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
          };

          return (
            <motion.div
              className="absolute cursor-pointer"
              key={i}
              //style={{ transformOrigin: "center bottom" }}
              animate={animate}
              exit={"hidden"}
              transition={{ duration: isHovered ? 0.1 : 0.3 }}
              onHoverStart={() => {
                setHoveredId(i);
              }}
              onHoverEnd={() => setHoveredId(null)}
            >
              {props.render(item, i, arr)}
            </motion.div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function offsetFromCenter<T>(array: T[], index: number): number {
  return index - Math.floor(array.length / 2);
}
