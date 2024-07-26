"use client";

import { CardType } from "@/models/cards/_CardType";
import { KittenCard } from "./card";
import { PlayArea } from "./play-area";
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { Hand } from "./hand";

import { useGame } from "../game-provider";

export function Board() {
  const { gameState, playerState } = useGame();
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
            <div className="absolute -bottom-4 h-card-height w-full">
              <div className="flex h-full w-full items-start justify-center">
                <Hand cards={playerState?.playerHandOfCards ?? []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
