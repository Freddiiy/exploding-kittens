"use client";

import { Button } from "@/components/ui/button";
import { H4, Muted } from "@/components/ui/typography";
import { api } from "@/trpc/react";
import Link from "next/link";

export function Rooms() {
  return (
    <div className="flex flex-col gap-2 p-4 pt-0">
      {allRooms.map((room) => (
        <Link
          href={`/join/${room.gameId}`}
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
