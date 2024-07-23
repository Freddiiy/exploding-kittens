import Deck from "@/models/Card";
import BaseCard, { BaseCardJSON } from "@/models/cards/_BaseCard";
import { Expansion } from "@/models/expansions/_ExpansionInterface";
import { Game, GameStatus, type GameSettings } from "@/models/game/Game";
import { Player, type PlayerData } from "@/models/Player";
import { type Server, type Socket } from "socket.io";

export default class GameService {
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
        this.games.set(game.getId(), game);
        callback?.(game.getId());
      },
    );
  }

  private handleJoinGame(socket: Socket) {
    socket.on(
      GAME_ACTIONS.JOIN,
      async ({ gameId, player }: JoinGameHandler, callback) => {
        const game = this.getGame(gameId);

        if (
          game
            .getPlayerManager()
            .getPlayers()
            .every((p) => p.getId() !== player.userId)
        ) {
          const newPlayer = new Player(player);
          newPlayer.setSocketId(socket.id);
          game.addPlayer(newPlayer);
        }
        socket.join(gameId);

        console.log(
          "AMOUNT OF PLAYRES: ",
          game.getPlayerManager().getPlayers().length,
        );

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

        const currentPlayer = game
          .getPlayerManager()
          .getPlayers()
          .find((p) => p.getId() === userId);

        if (!currentPlayer) return;

        game;

        socket.join(gameId);

        const rejoinData: RejoinData = {
          userId,
          settings: {
            publicGame: game.isPublic(),
            name: game.getName(),
            expansions: game.getExpansions(),
          },
          players: game.getPlayerManager().getPlayers(),
        };

        socket.in(gameId).emit(GAME_ACTIONS.REJOIN_DATA, rejoinData);
      },
    );
  }

  private sendGameState(gameId: string) {
    const game = this.getGame(gameId);

    const players = game.getPlayerManager().getPlayers();
    const currentPlayer = game.getCurrentPlayer();

    const baseGameState: GameState = {
      id: game.getId(),
      players: players.map((player) => {
        const playerClient: PlayerClient = {
          id: player.getId(),
          username: player.getUsername(),
          avatar: player.getAvatar(),
          handSize: player.getHandOfCard().length,
          isCurrentTurn: game.isPlayersTurn(player),
        };

        return playerClient;
      }),
      currentPlayerId: currentPlayer?.getId() ?? null,
      deckSize: game.getDeckManger().getDeckSize(),
      discardPile: game
        .getDeckManger()
        .getDiscardPile()
        .map((card) => card.toJSON()),
      status: game.getStatus(),
      maxPlayers: game.getPlayerManager().getMaxPlayers(),
      expansionsInPlay: game.getExpansions(),
    };

    /**
     * Here we split each players state up in personalized chuncks so we don't share
     * "sensitive" game states like what cards they have on their hands and so on.
     *
     * This prevents knowledgable individuals to sneak into the socket layer and
     * peek at the gameState.
     */

    players.forEach((player) => {
      const playerSocketId = player.getSocketId();
      if (playerSocketId) {
        const playerSocket = this.io.sockets.sockets.get(playerSocketId);
        if (playerSocket) {
          const playerState: PlayerSpecificGameState = {
            ...baseGameState,
            playerHandOfCards: player
              .getHandOfCard()
              .map((card) => card.toJSON()),
            isPlayersTurn: game.isPlayersTurn(player),
          };

          playerSocket.emit(GAME_ACTIONS.SYNC, playerState);
        }
      }
    });
  }

  private getGame(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) {
      throw new Error("Game does not exist");
    }

    return game;
  }
}

export interface PlayerClient {
  id: string;
  username: string;
  avatar: string;
  handSize: number;
  isCurrentTurn: boolean;
}
export interface GameState {
  id: string;
  players: PlayerClient[];
  currentPlayerId: string | null;
  deckSize: number;
  status: GameStatus;
  maxPlayers: number;
  expansionsInPlay: Expansion[];
  discardPile: BaseCardJSON[];
}

export interface PlayerSpecificGameState extends GameState {
  playerHandOfCards: BaseCardJSON[];
  isPlayersTurn: boolean;
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
