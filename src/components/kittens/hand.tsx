import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import {
  canComboWith,
  canComboWithArray,
  KittenCard,
  KittenCardCard,
  KittenCardSkeleton,
} from "./card";
import { useGiveCard } from "../give-cards-dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useGame } from "../game-provider";
import { playCard } from "@/lib/actions";
import { useUser } from "../user-context";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

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

  const game = useGame();
  const user = useUser();

  const [selectedCards, setSelectedCards] = useState<BaseCardJSON[]>([]);
  const [currentlySelectedCard, setCurrentlySelectedCard] =
    useState<BaseCardJSON | null>(null);

  function isCardSelected(card: BaseCardJSON) {
    return selectedCards.includes(card);
  }

  function toggleCardToSelected(card: BaseCardJSON) {
    if (selectedCards.includes(card))
      setSelectedCards((x) => x.filter((y) => y.cardId !== card.cardId));
    else {
      setSelectedCards((x) => x.concat(card));
    }

    setCurrentlySelectedCard((card) =>
      card?.cardId !== card?.cardId ? card : null,
    );
  }

  useEffect(() => {
    const onResize = () => setHandWidth(ref.current!.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function angle(i: number) {
    const factor = props.cards.length / 4;
    let x = offsetFromCenter(props.cards, i) * 0.045;
    if (props.cards.length % 2 === 0) x += 0.02;
    const distanceBetweenMultiplier = 0.8;
    return x * ((Math.PI / factor) * distanceBetweenMultiplier);
  }

  const hoveredCard = props.cards.find((c) => c.cardId === hoveredCardId)!;

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={ref}
        className="flex h-full max-h-card-height w-full justify-center"
      >
        {props.cards.map((card, i) => {
          const padding = 40;
          const isHovered = hoveredCardId === card.cardId;

          const applyCardSelected = isCardSelected(card) ? -50 : 0;

          const x =
            (isHovered ? Math.sin(angle(i)) * padding : 0) +
            virtualFanWidth * Math.sin(angle(i));
          const y =
            (isHovered ? -Math.cos(angle(i)) * padding : 0) +
            applyCardSelected +
            virtualFanHeight * (1 - Math.cos(angle(i)));
          const animate = {
            x,
            y,
            rotate: `${angle(i)}rad`,
          };

          return (
            <motion.div
              className={cn("absolute bottom-48 cursor-pointer")}
              key={card.cardId}
              layout={false}
              animate={animate}
              exit={"hidden"}
              transition={{ duration: isHovered ? 0.1 : 0.3 }}
              onHoverStart={() => {
                setHoveredCardId(card.cardId);
                setHoveredCardPosition({ x, y });
              }}
              onHoverEnd={() => setHoveredCardId(null)}
              onClick={() => {
                toggleCardToSelected(card);
              }}
            >
              <div
                className={cn(
                  "relative transition-all duration-75",
                  hoveredCard?.cardId === card.cardId && "opacity-0",
                )}
              >
                <KittenCard card={card} />
                <div
                  className={cn(
                    "absolute inset-0 z-10 rounded-lg bg-black opacity-0 transition-all duration-150",
                    selectedCards.length > 0 &&
                      !canComboWithArray(card, selectedCards) &&
                      "opacity-35",
                  )}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Preview layer */}

        {!isGiveCardOpen && (
          <LayoutGroup>
            <AnimatePresence key={"preview-card-" + hoveredCardId}>
              {hoveredCardId && hoveredCard && (
                <motion.div
                  key={hoveredCard.cardId}
                  initial={{
                    x: hoveredCardPosition.x,
                    y: 100,
                  }}
                  animate={{
                    scale: 1.5,
                    x: hoveredCardPosition.x,
                    y: isCardSelected(hoveredCard) ? 50 : 90,
                  }}
                  exit={{
                    opacity: 0,
                    x: hoveredCardPosition.x,
                    y: 100,
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
      <div className="absolute inset-x-0 bottom-8 mx-auto max-w-fit">
        <Card className="p-1">
          <CardContent className="p-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={"blue"}
                  size={"lg"}
                  className="h-16 w-56"
                  disabled={
                    !game.playerState?.isPlayersTurn ||
                    selectedCards.length <= 0
                  }
                  onClick={() => {
                    if (selectedCards.length <= 0) return;
                    const gameId = game.gameState?.id;
                    if (!gameId) return;
                    playCard(
                      gameId,
                      user.user.userId,
                      selectedCards.flatMap((x) => x.cardId),
                    );
                    setSelectedCards([]);
                  }}
                >
                  Play
                </Button>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-center">
                    <span>
                      {selectedCards.length} / {props.cards.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size={"icon"} variant={"outline"}>
                      <ChevronLeftIcon />
                    </Button>
                    <Button size={"icon"} variant={"outline"}>
                      <ChevronRightIcon />
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={"yellow"}
                  size={"lg"}
                  className="h-16 w-56"
                  disabled={selectedCards.length <= 0}
                  onClick={() => setSelectedCards([])}
                >
                  Deselect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function offsetFromCenter<T>(array: T[], index: number): number {
  return index - Math.floor(array.length / 2);
}
