"use client";

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
    <div>
      {allRooms.map((room) => (
        <div key={room} className="flex items-center gap-2">
          <p>{room}</p>
          <button
            type="button"
            onClick={() => {
              joinMutation.mutate({ gameId: room });
            }}
          >
            JOIN
          </button>
        </div>
      ))}
    </div>
  );
}
