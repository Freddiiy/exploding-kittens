"use client";

import { GAME_ACTIONS } from "@/server/api/handlers/actions";
import { socket } from "@/trpc/socket";
import { useEffect } from "react";

export function useSync() {
  useEffect(() => {
    socket.on(GAME_ACTIONS.SYNC, () => console.log("sync on"));

    return () => {
      socket.off(GAME_ACTIONS.SYNC, () => console.log("sync off"));
    };
  });
}
