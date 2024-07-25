"use client";

import { CardType } from "@/models/cards/_CardType";
import { KittenCard } from "./card";
import { PlayArea } from "./play-area";
import { DndContext, DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import { useState } from "react";
import { Hand } from "./hand";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { generateRandomId } from "@/lib/generateRandomId";

export function Board() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id;
    setActiveId(id ? id.toString() : null);
  };

  const explodingKittensCards: BaseCardJSON[] = [
    {
      cardId: generateRandomId(16),
      type: CardType.EXPLODING_KITTEN,
      name: "Exploding Kitten",
      description: "You explode. You are dead. Game over.",
      mechanics: "Unless you have a Defuse card, you're out of the game.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.DEFUSE,
      name: "Defuse",
      description: "Save yourself from an Exploding Kitten.",
      mechanics:
        "Play this card to prevent explosion. Then, secretly put the Exploding Kitten card back in the draw pile.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.NOPE,
      name: "Nope",
      description: "Stop the action of another player.",
      mechanics:
        "Play any time to stop any action except for an Exploding Kitten or a Defuse card.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.ATTACK,
      name: "Attack",
      description:
        "End your turn without drawing and force the next player to take two turns.",
      mechanics:
        "The next player takes two turns in a row. Play continues from that player.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.SKIP,
      name: "Skip",
      description: "End your turn without drawing a card.",
      mechanics: "Immediately end your turn without drawing a card.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.FAVOR,
      name: "Favor",
      description: "Force another player to give you a card of their choice.",
      mechanics:
        "Choose any other player and they must give you a card from their hand.",
    },
    {
      cardId: generateRandomId(16),
      type: CardType.SHUFFLE,
      name: "Shuffle",
      description: "Shuffle the draw pile.",
      mechanics: "Shuffle the draw pile thoroughly and randomly.",
    },
  ];

  return (
    <DndContext>
      <div className="overflow-hidden">
        <div className="relative grid min-h-screen grid-rows-12">
          <div
            id="other players"
            className="relative row-span-3 flex justify-center"
          ></div>
          <div
            id="board"
            className="row-span-6 flex w-full flex-1 items-center justify-center p-4"
          >
            <PlayArea />
          </div>
          <div
            id="player"
            className="relative row-span-3 flex items-center justify-center"
          >
            <div className="absolute bottom-3 h-card-height w-full">
              <div className="flex h-full w-full items-start justify-center">
                <Hand cards={explodingKittensCards} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
