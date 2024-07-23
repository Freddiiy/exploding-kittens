import { useGameId } from "@/components/game-provider";
import { useUser } from "@/components/user-context";
import { GAME_ACTIONS } from "@/services/GameService";
import { socket } from "@/trpc/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useConnectedToGame() {
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const gameId = useGameId();
  const { user } = useUser();

  useEffect(() => {
    const attemptConnection = () => {
      if (!connected) {
        socket.emit(
          GAME_ACTIONS.JOIN,
          {
            gameId,
            player: user,
          },
          (response?: "connected") => {
            if (response === "connected") {
              setConnected(true);
            } else {
              // If connection fails, increment retry count and try again after delay
              setRetryCount((prevCount) => prevCount + 1);
            }
          },
        );
      }
    };

    if (!connected) {
      const delay = Math.min(30000, 1000 * Math.pow(2, retryCount)); // Exponential backoff, max 30 seconds
      const timer = setTimeout(attemptConnection, delay);
      return () => clearTimeout(timer);
    }
  }, [connected, gameId, user, retryCount]);

  return { connected, retryCount };
}
