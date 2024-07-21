import { type Server, type Socket } from "socket.io";
import { GAME_ACTIONS } from "./actions";
import { activeGames, getGame } from "../games";
import { type GameSettings } from "@/models/GameLogic";
import { type Player } from "@/models/Player";

interface RejoinGameHandler {
  userId: string;
  gameId: string;
}

interface RejoinData {
  userId: string;
  settings: GameSettings;
  players: Player[];
}
export function rejoinGameHandler(io: Server, socket: Socket) {
  socket.on(
    GAME_ACTIONS.REJOIN,
    async ({ userId, gameId }: RejoinGameHandler) => {
      const gameExists = activeGames.has(gameId);
      if (!gameExists) return;

      const game = getGame(gameId);

      socket.join(gameId);

      const rejoinData: RejoinData = {
        userId,
        settings: game.gameSettings,
        players: game.gameState.players,
      };

      io.in(gameId).emit(GAME_ACTIONS.REJOIN_DATA, rejoinData);
    },
  );
}
