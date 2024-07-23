"use client";

import { useGame } from "@/components/game-provider";
import { useSocket } from "@/trpc/socket";

export function AllPlayersList() {
  const { gameState } = useGame();
  const { isConnected } = useSocket();

  return (
    <div>
      <p>Connected: {isConnected ? "TRUE" : "FALSE"}</p>
      <p>Players:</p>
      {gameState?.players.map((player) => (
        <div key={player.username} className="flex items-center gap-2">
          <p>{player.username}</p>
          <p>as {player.avatar}</p>
        </div>
      ))}
    </div>
  );
}
