"use client";

import { H1 } from "@/components/ui/typography";

import { LobbyGameSettings } from "../../game/[gameId]/lobby-game-settings";

export default function Page() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-12">
      <H1>Lobby</H1>
      <div>
        <LobbyGameSettings />
      </div>
    </div>
  );
}
