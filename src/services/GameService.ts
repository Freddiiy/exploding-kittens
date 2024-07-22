import { Game, type GameSettings } from "@/models/Game";
import { type Player, type PlayerData } from "@/models/Player";
import { type Server, type Socket } from "socket.io";

export default class GameHandler {
  private io: Server;
  private games: Map<string, Game> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.socketHandler();
  }

  private socketHandler() {
    this.io.on("connection", (socket) => {
      this.handleCreateGame(socket);
      this.handleJoinGame(socket);
      this.handleRejoinGame(socket);

      socket.on("disconnect", () => {
        console.log(`Disconnected: ${socket.id}`);
      });
    });
  }

  private handleCreateGame(socket: Socket) {
    socket.on(
      GAME_ACTIONS.CREATE,
      async ({ settings }: CreateGameHandler, callback) => {
        if (!settings.name) {
          settings.name = "An game of Exploding Kittens";
        }
        const game = new Game(settings);
        this.games.set(game.id, game);
        callback?.(game.id);
      },
    );
  }

  private handleJoinGame(socket: Socket) {
    socket.on(
      GAME_ACTIONS.JOIN,
      async ({ gameId, player }: JoinGameHandler, callback) => {
        const game = this.getGame(gameId);
        game.addPlayer(player);
        socket.join(gameId);

        console.log("AMOUNT OF PLAYRES: ", game.players.length);

        callback?.("connected");
        socket.in(gameId).emit(GAME_ACTIONS.SYNC, game);
      },
    );
  }

  private handleRejoinGame(socket: Socket) {
    socket.on(
      GAME_ACTIONS.REJOIN,
      async ({ userId, gameId }: RejoinGameHandler) => {
        const gameExists = this.games.has(gameId);
        if (!gameExists) return;

        const game = this.getGame(gameId);

        socket.join(gameId);

        const rejoinData: RejoinData = {
          userId,
          settings: game.gameSettings,
          players: game.players,
        };

        socket.in(gameId).emit(GAME_ACTIONS.REJOIN_DATA, rejoinData);
      },
    );
  }

  private getGame(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) {
      throw new Error("Game does not exist");
    }

    return game;
  }
}

export const GAME_ACTIONS = {
  CREATE: "create",
  JOIN: "join",
  REJOIN: "rejoin",
  REJOIN_DATA: "rejoinData",
  SYNC: "sync",
};

export interface CreateGameHandler {
  settings: GameSettings;
}

export interface JoinGameHandler {
  gameId: string;
  player: PlayerData;
}

interface RejoinGameHandler {
  userId: string;
  gameId: string;
}

interface RejoinData {
  userId: string;
  settings: GameSettings;
  players: Player[];
}
