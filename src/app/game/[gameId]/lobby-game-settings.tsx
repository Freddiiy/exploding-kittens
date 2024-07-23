"use client";

import { useGame } from "@/components/game-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H4, H6 } from "@/components/ui/typography";
import { useUser } from "@/components/user-context";
import { generateRandomId } from "@/lib/generateRandomId";
import { useParams } from "next/navigation";
import { useState } from "react";

export function LobbyGameSettings() {
  const { gameState } = useGame();
  const params = useParams();
  const gameId = params.gameId as string;

  const [playerName, setPlayerName] = useState("");
  const { user, setUser } = useUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Create player</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Username</Label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Button
              type="button"
              onClick={() =>
                setUser({
                  userId: generateRandomId(16),
                  username: playerName,
                  avatar: "God Cat",
                })
              }
            >
              Create character
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <H4>Players</H4>
      {gameState?.players.map((player) => (
        <p key={player.username}>{player.username}</p>
      ))}
    </div>
  );
}
