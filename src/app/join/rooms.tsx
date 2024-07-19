"use client";

import { Button } from "@/components/ui/button";
import { H1, H2, H4, H6, Muted, P } from "@/components/ui/typography";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function Rooms() {
  const [allRooms] = api.game.getAllGames.useSuspenseQuery();

  const router = useRouter();
  const joinMutation = api.game.joinGame.useMutation({
    onSuccess: (data, variables) => {
      router.push(`/join/${variables.gameId}`);
    },
  });

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      <H1>Games list</H1>
      {allRooms.map((room) => (
        <button
          key={room?.gameId}
          className="flex flex-col items-start gap-2 rounded-lg border p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex w-full justify-between gap-2">
            <H4>{room?.name}</H4>
            <Muted className="text-base">{room.playerCount} / 5</Muted>
          </div>
          <div>
            <Button
              type="button"
              onClick={() => {
                joinMutation.mutate({ gameId: room?.gameId });
              }}
            >
              JOIN
            </Button>
          </div>
        </button>
      ))}
    </div>
  );
}
