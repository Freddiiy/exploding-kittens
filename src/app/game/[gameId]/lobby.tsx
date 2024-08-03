"use client";

import { CopyButton } from "@/components/copy-button";
import { GameAvatar, PlayerAvatar } from "@/components/game-avatar";
import { useGame, useGameId } from "@/components/game-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H4, H6, Muted, P } from "@/components/ui/typography";
import { useUser } from "@/components/user-context";
import { startGame } from "@/lib/actions";
import { useSocket } from "@/trpc/socket";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export function Lobby() {
  const { user } = useUser();
  const { gameState } = useGame();

  const isOwner = gameState?.players.at(0)?.id === user.userId;

  return (
    <div className="mx-auto max-w-lg pt-12">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Players</CardTitle>
              <Badge className="text-base">
                {gameState?.players.length} / {gameState?.maxPlayers}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row flex-wrap items-center justify-center gap-4">
              {gameState?.players.map((player) => (
                <PlayerAvatar key={player.id} user={player} />
              ))}
            </div>
          </CardContent>
        </Card>

        <RoomCode />

        {isOwner && (
          <div className="w-full">
            <Button
              type="button"
              size={"lg"}
              className="w-full"
              onClick={() => startGame(gameState.id, user.userId)}
            >
              Start game
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function RoomCode() {
  const gameId = useGameId();
  const urlOrigin = window.location.origin;

  const fullUrl = urlOrigin + "/game/" + gameId;
  return (
    <div className="flex h-10 w-full items-center overflow-hidden rounded-lg border">
      <div className="group flex h-full w-full items-center justify-center bg-muted/30">
        <div className="px-4">
          <div className="group-hover:flex [&:not(:hover)]:hidden">
            <P className="text-xl">{fullUrl}</P>
          </div>
          <div className="group-hover:hidden [&:not(:hover)]:flex">
            <P className="text-xl">Hover to reveal invite link</P>
          </div>
        </div>
      </div>
      <CopyButton className="h-10 w-10 rounded-l-none" value={fullUrl} />
    </div>
  );
}
