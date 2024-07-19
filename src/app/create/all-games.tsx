"use client";

import { api } from "@/trpc/react";

export function AllGames() {
  const [allGames] = api.game.getAllGames.useSuspenseQuery();
  return (
    <div>
      {allGames.map((game) => (
        <p key={game.gameId}>
          {game.name} {game.gameId} {game.playerCount}/5
        </p>
      ))}
    </div>
  );
}
