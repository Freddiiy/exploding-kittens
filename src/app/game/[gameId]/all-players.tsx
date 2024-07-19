"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";

export function AllPlayersList() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [players] = api.game.getAllPlayers.useSuspenseQuery({ gameId });

  return (
    <div>
      {players.map((player) => (
        <div key={player.name} className="flex items-center gap-2">
          <p>{player.name}</p>
          <p>as {player.character}</p>
        </div>
      ))}
    </div>
  );
}
