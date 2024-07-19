import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type GameState from "@/models/GameState";
import { GameLogic } from "@/models/GameLogic";
import { ExpansionSchema } from "../../../models/expansions/_ExpansionInterface";
import { roomSchema } from "@/server/constants/roomSchema";

// create a global event emitter (could be replaced by redis, etc)

const activeGames = new Map<string, GameLogic>();

export const gameRouter = createTRPCRouter({
  getAllGames: publicProcedure.query(async () => {
    return Array.from(activeGames, ([key]) => key);
  }),
  createGame: publicProcedure
    .input(
      z.object({
        expansions: z.array(ExpansionSchema),
        settings: z.object({
          public: z.boolean(),
          name: z.string().min(3),
        }),
      }),
    )
    .mutation(async (opts) => {
      const { ee } = opts.ctx;
      const expansions = opts.input.expansions;
      const game = new GameLogic(ee, expansions);
      activeGames.set(game.gameId, game);
      ee.emit("createGame", game.gameId);
      ee.emit("joinGame");
      return game.gameId;
    }),
  onCreateGame: publicProcedure.subscription(({ ctx }) => {
    return observable((emit) => {
      const onCreateGame = (data: string) => {
        const game = activeGames.get(data);
        game?.addPlayer("Player", "Kitten");
        emit.next(data);
      };

      ctx.ee.on("createGame", onCreateGame);
      return () => {
        ctx.ee.off("createGame", onCreateGame);
      };
    });
  }),
  getAllPlayers: publicProcedure.input(roomSchema).query(async (opts) => {
    const game = activeGames.get(opts.input.gameId);
    return game?.gameState.players ?? [];
  }),
  joinGame: publicProcedure.input(roomSchema).mutation(({ ctx, input }) => {
    const game = activeGames.get(input.gameId);
    game?.addPlayer("Player2", "Kitten");
    ctx.ee.emit("joinGame", game);
  }),
  onJoinGame: publicProcedure.subscription(({ ctx }) => {
    return observable<GameLogic>((emit) => {
      const onJoin = (data: GameLogic) => {
        const game = activeGames.get(data.gameId);
        game?.addPlayer("Player2", "Kitten");
        emit.next(data);
      };

      ctx.ee.on("joinGame", onJoin);
      return () => {
        ctx.ee.off("add", onJoin);
      };
    });
  }),
});
