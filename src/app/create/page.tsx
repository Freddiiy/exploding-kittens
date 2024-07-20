"use client";
import { api } from "@/trpc/react";
import { PlayerEditor } from "../../components/player-editor";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type PlayerOptions } from "@/models/Player";
import {
  createGameSchema,
  type CreateGameType,
} from "@/server/constants/createGameSchema";
import useLocalStorage from "@/hooks/useLocalStorage";
import { generateRandomId } from "@/lib/generateRandomId";
import { GameSettings } from "../../components/game-settings";
import { useRouter } from "next/navigation";
import { H1 } from "@/components/ui/typography";

export default function Page() {
  const utils = api.useUtils();
  const router = useRouter();
  const createMutation = api.game.createGame.useMutation({
    onSuccess: async (data) => {
      await utils.game.getAllGames.invalidate();
    },
  });

  const joinGameMutation = api.game.joinGame.useMutation();

  const [localStoragePlayer, setLocalStoragePlayer] =
    useLocalStorage<PlayerOptions>("player", {
      playerId: generateRandomId(16),
      name: "",
      character: "",
    });

  const form = useForm<CreateGameType>({
    defaultValues: {
      player: localStoragePlayer ?? { playerId: generateRandomId(16) },
      expansions: [],
      settings: {
        name: "",
        public: true,
      },
    },
    resolver: zodResolver(createGameSchema),
  });

  const onSubmit: SubmitHandler<CreateGameType> = async (data) => {
    setLocalStoragePlayer(data.player);
    const gameId = await createMutation.mutateAsync(data);

    if (gameId) {
      await joinGameMutation.mutateAsync({
        player: data.player,
        gameId,
      });
      router.push(`/join/${gameId}`);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 py-12">
      <H1>Create a game</H1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <PlayerEditor />
            <GameSettings />
            <Button
              size={"lg"}
              className="w-full text-2xl"
              isLoading={createMutation.isPending || joinGameMutation.isPending}
            >
              Create game
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
