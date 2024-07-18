import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type GameState from "@/models/GameState";
import { GameLogic } from "@/models/GameLogic";
import { ExpansionSchema } from "../../../models/expansions/_ExpansionInterface";

// create a global event emitter (could be replaced by redis, etc)

let game: GameLogic | null = null;

const activeGames = new Set<Record<string, GameState>>();

export const gameRouter = createTRPCRouter({
  getAllGames: publicProcedure.query(async () => {
    const allGames: string[] = [];
    activeGames.forEach((record) => {
      Object.keys(record).forEach((key) => {
        allGames.push(key);
      });
    });

    return allGames;
  }),
  createGame: publicProcedure
    .input(
      z.object({
        expansions: z.array(ExpansionSchema),
      }),
    )
    .mutation(async (opts) => {
      const { ee } = opts.ctx;
      const expansions = opts.input.expansions;
      game = new GameLogic(ee, expansions);
      activeGames.add({ [game.gameId]: game.gameState });
      return game.gameId;
    }),
  onCreateGame: publicProcedure.subscription(({ ctx }) => {
    game?.addPlayer("Player", "Kitten");
  }),
});
