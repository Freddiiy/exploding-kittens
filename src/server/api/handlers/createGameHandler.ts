import { type Server, type Socket } from "socket.io";
import { GAME_ACTIONS } from "./actions";
import { activeGames } from "../games";
import { GameLogic, type GameSettings } from "@/models/GameLogic";

export interface CreateGameHandler {
  settings: GameSettings;
}
export function createGameHandler(io: Server, socket: Socket) {
  socket.on(
    GAME_ACTIONS.CREATE,
    async ({ settings }: CreateGameHandler, callback) => {
      if (!settings.name) {
        settings.name = "An game of Exploding Kittens";
      }
      const game = new GameLogic(settings);
      activeGames.set(game.gameId, game);
      callback?.(game.gameId);
    },
  );
}
