"use client";

import { baseExpansion } from "@/models/expansions/BaseDeck";
import { api } from "@/trpc/react";
import { AllGames } from "./all-games";

export default function Page() {
  const utils = api.useUtils();
  const createMutation = api.game.createGame.useMutation({
    onSuccess: async (data) => {
      await utils.game.getAllGames.invalidate();
    },
  });
  const expansions = [baseExpansion];
  return (
    <div>
      <AllGames />
      <button
        type="button"
        onClick={() => createMutation.mutate({ expansions: expansions })}
      >
        Create game
      </button>
    </div>
  );
}
