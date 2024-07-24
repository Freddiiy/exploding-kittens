"use client";

import { Button } from "@/components/ui/button";
import { H2, H4, Muted } from "@/components/ui/typography";
import { GAME_ACTIONS, type Room } from "@/services/GameService";
import { socket } from "@/trpc/socket";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Rooms() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);

  useEffect(() => {
    socket.emit(GAME_ACTIONS.GET_ROOMS);

    socket.on(GAME_ACTIONS.ROOMS, (rooms: Room[]) => {
      setAllRooms(rooms);
    });

    return () => {
      socket.off(GAME_ACTIONS.ROOMS);
    };
  }, []);

  if (allRooms.length === 0) {
    return (
      <div className="flex w-full justify-center py-4">
        <H2>No games found...</H2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {allRooms.map((room) => (
        <Link
          prefetch={false}
          href={`/game/${room.gameId}`}
          key={room?.gameId}
          className="flex flex-col items-start gap-2 rounded-lg border p-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex w-full justify-between gap-2">
            <H4>{room?.name}</H4>
            <Muted className="text-base">{room.playerCount} / 5</Muted>
          </div>
          <div>
            <Button tabIndex={-1} type="button">
              JOIN
            </Button>
          </div>
        </Link>
      ))}
    </div>
  );
}
