"use client";

import { baseExpansion } from "@/models/expansions/BaseDeck";
import { api } from "@/trpc/react";
import { AllGames } from "./all-games";
import { PlayerEditor } from "./player-editor";
import { Button } from "@/components/ui/button";

export default function Page() {
  const utils = api.useUtils();
  const createMutation = api.game.createGame.useMutation({
    onSuccess: async (data) => {
      await utils.game.getAllGames.invalidate();
    },
  });
  const expansions = [baseExpansion];
  return (
    <div className="mx-auto max-w-screen-lg">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <AllGames />
        <PlayerEditor />
        <Button
          type="button"
          size={"lg"}
          className="w-full text-2xl"
          onClick={() =>
            createMutation.mutate({
              expansions: expansions,
              settings: {
                public: true,
                name: "Exploding kittens game",
              },
            })
          }
        >
          Create game
        </Button>
      </div>
    </div>
  );
}
