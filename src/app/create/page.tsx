"use client";
import { PlayerEditor } from "../../components/player-editor";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import {
  createGameSchema,
  type CreateGameType,
} from "@/server/constants/createGameSchema";
import { GameSettings } from "../../components/game-settings";
import { useRouter } from "next/navigation";
import { H1 } from "@/components/ui/typography";
import { useUser } from "@/components/user-context";
import { socket } from "@/trpc/socket";
import { GAME_ACTIONS } from "@/services/GameService";
import { useState } from "react";

export default function Page() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<CreateGameType>({
    defaultValues: {
      player: user,
      settings: {
        expansions: [],
        name: "",
        publicGame: true,
      },
    },
    resolver: zodResolver(createGameSchema),
  });

  const onSubmit: SubmitHandler<CreateGameType> = async (data) => {
    setIsLoading(true);
    setUser(data.player);
    socket.emit(
      GAME_ACTIONS.CREATE,
      { settings: data.settings },
      (response?: string) => {
        router.push(`/game/${response}`);
      },
    );
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 py-12">
      <H1>Create a game</H1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <PlayerEditor />
            <GameSettings />
            <Button size={"lg"} className="w-full" isLoading={isLoading}>
              Create game
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
