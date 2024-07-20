import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { GameLogic } from "@/models/GameLogic";
import { createGameSchema } from "@/server/constants/createGameSchema";
import { joinGameSchema } from "@/server/constants/joinGameSchema";
import GameState from "@/models/GameState";
import { createNextApiHandler } from "@trpc/server/adapters/next";

const activeGames = new Map<string, GameLogic>();

export const gameRouter = createTRPCRouter({
  getAllGames: publicProcedure.query(async () => {
    const allGames = Array.from(activeGames, ([key, game]) => {
      if (game.gameSettings.public) {
        return {
          gameId: key,
          playerCount: game.gameState.players.length,
          name: game.gameSettings.name,
        };
      }
    }).filter((game) => game !== undefined);

    return allGames;
  }),
  createGame: publicProcedure.input(createGameSchema).mutation(async (opts) => {
    const { ee } = opts.ctx;
    const { expansions, settings } = opts.input;
    const game = new GameLogic(ee, expansions, settings);
    activeGames.set(game.gameId, game);
    opts.ctx;
    ee.emit("joinGame", game.gameState);
    return game.gameId;
  }),
  getAllPlayers: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async (opts) => {
      const game = activeGames.get(opts.input.gameId);
      return game?.gameState.players ?? [];
    }),
  joinGame: publicProcedure.input(joinGameSchema).mutation(({ ctx, input }) => {
    const game = activeGames.get(input.gameId);
    if (game) {
      game.addPlayer(input.player);
      ctx.ee.emit("updateLobby");
      ctx.ee.emit("joinGame", game.gameState);
    }
  }),
  onJoinGame: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .subscription(({ ctx }) => {
      return observable<GameState>((emit) => {
        const onJoin = (data: GameState) => {
          emit.next(data);
        };

        ctx.ee.on("joinGame", onJoin);
        return () => {
          ctx.ee.off("joinGame", onJoin);
        };
      });
    }),
  lobby: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .subscription(({ ctx, input }) => {
      return observable((emit) => {
        const onLobbyUpdate = (data: string) => {
          const game = activeGames.get(input.gameId);
          if (game) {
            emit.next(game);
          }
        };

        ctx.ee.on("updateLobby", onLobbyUpdate);
      });
    }),
});
