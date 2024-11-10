import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { socket } from "@/trpc/socket";
import { GAME_ACTIONS } from "@/services/GameService";
import { useGameId } from "./game-provider";
import { H2, H4 } from "./ui/typography";
import {
  type BroadcastMessage,
  GAME_REQUESTS,
} from "@/models/game/RequestManager";

export function BroadcastMessage() {
  const gameId = useGameId();
  const controls = useAnimation();
  const [message, setMessage] = useState<string | null>("");

  useEffect(() => {
    socket.on(GAME_REQUESTS.BROADCAST_MESSAGE, (data: BroadcastMessage) => {
      setMessage(data.message);
    });

    const timeout = setTimeout(() => {
      setMessage(null);
    }, 4500);

    return () => {
      clearTimeout(timeout);
      socket.off(GAME_REQUESTS.BROADCAST_MESSAGE);
    };
  }, [gameId]);

  useEffect(() => {
    if (message) {
      controls
        .start({
          scale: 1,
          opacity: 1,
          transition: { duration: 0.1 },
        })
        .then(() => {
          controls.start({
            opacity: 0,
            scale: 1,
            transition: { duration: 0.5, delay: 2.5 },
          });
        });
    }
  }, [message, controls]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={controls}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center bg-black/60"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={controls}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <H4 className="text-8xl text-white">{message}</H4>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
