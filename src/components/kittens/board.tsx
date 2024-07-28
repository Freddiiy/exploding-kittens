"use client";

import { CardType } from "@/models/cards/_CardType";
import { KittenCard, KittenCardBackface } from "./card";
import { PlayArea } from "./play-area";
import {
  CollisionDetection,
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Hand } from "./hand";

import { useGame } from "../game-provider";
import { GameAvatar, PlayerAvatar } from "../game-avatar";
import { useUser } from "../user-context";
import { H3, H4, H6 } from "../ui/typography";
import { motion } from "framer-motion";

export function Board() {
  const { gameState, playerState } = useGame();
  const { user } = useUser();
  return (
    <DndContext>
      <div className="overflow-hidden">
        <div className="relative grid max-h-screen min-h-screen grid-rows-12">
          <div
            id="other players"
            className="relative row-span-3 flex justify-center"
          >
            <div className="flex gap-1 pt-4">
              {gameState?.players
                .filter((player) => player.id !== user.userId)
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col items-center -space-y-10"
                  >
                    <div>
                      <PlayerAvatar user={player} size="sm" />
                    </div>
                    <div className="relative flex scale-50 items-center justify-center">
                      <KittenCardBackface />
                      <div className="absolute left-1 top-1 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex size-20 items-center justify-center rounded-full bg-secondary">
                          <H3 className="text-4xl">{player.handSize}</H3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
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
