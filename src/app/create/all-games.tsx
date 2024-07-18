"use client";

import { api } from "@/trpc/react";

export function AllGames() {
  const [allGames] = api.game.getAllGames.useSuspenseQuery();
  return (
    <div>
      {allGames.map((game) => (
        <p key={game}>{game}</p>
      ))}
    </div>
  );
}
