import { type Server, type Socket } from "socket.io";
import { GAME_ACTIONS } from "./actions";

import { Player, type PlayerData } from "@/models/Player";
import { activeGames, getGame } from "../games";

export interface JoinGameHandler {
  gameId: string;
  player: PlayerData;
}
export function joinGameHandler(io: Server, socket: Socket) {
  socket.on(
    GAME_ACTIONS.JOIN,
    async ({ gameId, player }: JoinGameHandler, callback) => {
      const game = getGame(gameId);
      game.addPlayer(player);
      socket.join(gameId);

      console.log("AMOUNT OF PLAYRES: ", game.gameState.players.length);

      callback?.("connected");
      io.in(gameId).emit(GAME_ACTIONS.SYNC, game.gameState);
    },
  );
}
