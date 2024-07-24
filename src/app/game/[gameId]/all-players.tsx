"use client";

import { GameAvatar, PlayerAvatar } from "@/components/game-avatar";
import { useGame } from "@/components/game-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Muted } from "@/components/ui/typography";
import { useUser } from "@/components/user-context";
import { useSocket } from "@/trpc/socket";

export function AllPlayersList() {
  const { user } = useUser();
  const { gameState, gameStatus } = useGame();
  const { isConnected } = useSocket();

  if (!gameState) {
    return <div>Loading...</div>;
  }

  const isOwner = gameState.players.at(0)?.id === user.userId;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Players</CardTitle>
            <Badge className="text-base">
              {gameState.players.length} / {gameState.maxPlayers}
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

      {isOwner && (
        <div className="w-full">
          <Button size={"lg"} className="w-full">
            Start game
          </Button>
        </div>
      )}
    </div>
  );
}
