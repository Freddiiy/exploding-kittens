"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H4, H6 } from "@/components/ui/typography";
import useLocalStorage from "@/hooks/useLocalStorage";
import { generateRandomId } from "@/lib/generateRandomId";
import type GameState from "@/models/GameState";
import { PlayerOptions } from "@/models/Player";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LobbyGameSettings() {
  const params = useParams();
  const gameId = params.gameId as string;

  const joinRoom = api.game.joinGame.useMutation();
  const [lobbyState, setLobbyState] = useState<GameState>();

  const [playerName, setPlayerName] = useState("");

  const [localStoragePlayer, setLocalStoragePlayer] =
    useLocalStorage<PlayerOptions>("player", {
      playerId: generateRandomId(16),
      name: "",
      character: "",
    });

  api.game.onJoinGame.useSubscription(
    { gameId },
    {
      onData(data) {
        setLobbyState(data);
      },
    },
  );

  useEffect(() => {
    if (
      localStoragePlayer &&
      !lobbyState?.players.some(
        (p) => p.playerId === localStoragePlayer.playerId,
      )
    ) {
      joinRoom.mutate({ player: localStoragePlayer, gameId });
    }
  }, [gameId, localStoragePlayer, lobbyState]);

  if (!localStoragePlayer) {
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
                setLocalStoragePlayer({
                  playerId: generateRandomId(16),
                  name: playerName,
                  character: "God Cat",
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
      {lobbyState?.players.map((player) => (
        <p key={player.playerId}>{player.name}</p>
      ))}
    </div>
  );
}
