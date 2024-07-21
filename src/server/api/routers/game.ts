import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { GameLogic } from "@/models/GameLogic";
import { createGameSchema } from "@/server/constants/createGameSchema";
import { activeGames, getGame } from "../games";

export const gameRouter = createTRPCRouter({
  getAllGames: publicProcedure.query(async () => {
    const allGames = Array.from(activeGames)
      .filter(([_, game]) => game.gameSettings.publicGame)
      .map(([key, game]) => {
        return {
          gameId: key,
          playerCount: game.gameState.players.length,
          name: game.gameSettings.name,
        };
      });

    return allGames;
  }),
  createGame: publicProcedure.input(createGameSchema).mutation(async (opts) => {
    const { settings } = opts.input;
    if (!settings.name) {
      settings.name = "An game of Exploding Kittens";
    }
    const game = new GameLogic(settings);
    activeGames.set(game.gameId, game);
    console.log("CREATED: ", activeGames.size);
    console.log(getGame(game.gameId).gameId);
    return game.gameId;
  }),
  getAllPlayers: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async (opts) => {
      const game = activeGames.get(opts.input.gameId);
      return game?.gameState.players ?? [];
    }),
});
