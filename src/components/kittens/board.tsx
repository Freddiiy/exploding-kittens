"use client";

import { PlayArea } from "./play-area";
import { Hand } from "./hand";
import { useGame } from "../game-provider";
import { PlayerAvatar } from "../game-avatar";
import { useUser } from "../user-context";
import { H3 } from "../ui/typography";

export function Board() {
  const { gameState, playerState } = useGame();
  const { user } = useUser();
  return (
    <div className="overflow-hidden">
      <div className="flex max-h-screen min-h-screen grid-rows-12 flex-col justify-between">
        <div
          id="other players"
          className="flex flex-col items-center justify-center"
        >
          <div className="flex h-32 gap-1">
            {gameState?.players
              .filter((player) => player.id !== user.userId)
              .map((player) => {
                return (
                  <div
                    key={player.id}
                    className="flex flex-col items-center -space-y-10"
                  >
                    <div className="relative flex size-32 items-center justify-center">
                      <PlayerAvatar
                        user={player}
                        size="sm"
                        selected={player.isCurrentTurn}
                      />
                      <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                          <H3 className="text-xl">{player.handSize}</H3>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div>
            <PlayArea />
          </div>
        </div>

        <div id="player" className="flex items-center justify-center">
          <div className="h-full w-full">
            <div className="flex h-full w-full items-start justify-center">
              <Hand cards={playerState?.playerHandOfCards ?? []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveGameButton() {
  return null;
}
