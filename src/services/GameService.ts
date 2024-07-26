import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { type Expansion } from "@/models/expansions/_ExpansionInterface";
import { Game, type GameStatus, type GameSettings } from "@/models/game/Game";
import { Player, type PlayerData } from "@/models/Player";
import { socket } from "@/trpc/socket";
import { type Server, type Socket } from "socket.io";

export default class GameService {
  private io: Server;
  private games: Map<string, Game> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.socketHandler();
  }
  socketHandler() {
    this.io.on("connection", (socket) => {
      this.handleCreateGame(socket);
      this.handleJoinGame(socket);
      this.handleGetSync(socket);
      this.handleGetRooms(socket);
      this.handlePlayCard(socket);

      socket.on("disconnect", () => {
        console.log("PLAYER DISCONNECTED");
        const game = Array.from(this.games.values()).find((x) =>
          x
            .getPlayerManager()
            .getPlayers()
            .find((p) => p.getSocketId() === socket.id),
        );

        if (game) {
          const player = game
            .getPlayerManager()
            .getPlayers()
            .find((x) => x.getSocketId() === socket.id);

          if (player) {
            console.log(player.getUsername() + " disconnected");
            game.disconnectPlayer(player.getId());
            this.sendGameState(game.getId());
          }
        }
      });
    });
  }

  private handlePlayCard(socket: Socket) {
    socket.on(
      GAME_ACTIONS.PLAY_CARD,
      async ({ gameId, playerId, cardId }: PlayCardHadler) => {
        try {
          const game = this.getGame(gameId);
          const currentPlayer = game.getPlayerManager().getPlayerById(playerId);

          const card = currentPlayer?.getCardFromHand(cardId);

          if (!currentPlayer) {
            throw new Error("Player not found.");
          }

          if (!game.isPlayersTurn(currentPlayer)) {
            throw new Error("it's not your turn.");
          }

          if (!card) {
            throw new Error("Card not found in player's hand.");
          }

          await game.playCard(currentPlayer, card);
        } catch (error) {
          const err = error as Error;
          socket.emit(GAME_ACTIONS.ERROR, { message: err.message });
        }
      },
    );
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

        const currentPlayer = game
          .getPlayerManager()
          .getPlayers()
          .find((p) => p.getId() === player.userId);

        if (currentPlayer) {
          console.log("current player confirmed");
          game.reconnectPlayer(currentPlayer.getId(), socket.id);
        } else {
          console.log("not current player");
          const newPlayer = new Player(player);
          newPlayer.setSocketId(socket.id);
          game.addPlayer(newPlayer);
        }

        callback?.("connected");
        this.sendGameState(gameId);
      },
    );
  }

  private handleGetSync(socket: Socket) {
    socket.on(GAME_ACTIONS.GET_SYNC, async (gameId: string, callback) => {
      if (!this.games.has(gameId)) {
        callback?.("notFound");
      }
      this.sendGameState(gameId);
    });
  }

  ROOMS_CHANNEL = "rooms-channel";

  private handleGetRooms(socket: Socket) {
    socket.on(GAME_ACTIONS.GET_ROOMS, async () => {
      const allGames = Array.from(this.games.values())
        .filter((game) => game.isPublic() && game.getStatus() === "waiting")
        .map((game) => {
          const rooms: Room = {
            createdAt: game.getCreatedAt(),
            gameId: game.getId(),
            playerCount: game.getPlayerManager().getPlayers().length,
            maxPlayers: game.getPlayerManager().getMaxPlayers(),
            name: game.getName(),
          };
          return rooms;
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      socket.emit(GAME_ACTIONS.ROOMS, allGames);
    });
  }

  private sendGameState(gameId: string) {
    const game = this.getGame(gameId);

    const players = game.getPlayerManager().getPlayers();
    const currentPlayer = game.getCurrentPlayer();

    const baseGameState: GameState = {
      id: game.getId(),
      players: players.map((player) => ({
        id: player.getId(),
        username: player.getUsername(),
        avatar: player.getAvatar(),
        handSize: player.getHandOfCard().length,
        isCurrentTurn: game.isPlayersTurn(player),
      })),
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

    let defaultSend = true;

    players.forEach((player) => {
      if (player.getSocketId() === socket.id) {
        defaultSend = false;
      }

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

    if (defaultSend) {
      this.io.emit(GAME_ACTIONS.SYNC, baseGameState);
    }
  }

  private getGame(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) {
      throw new Error("Game does not exist");
    }

    return game;
  }
}

export interface PlayCardHadler {
  gameId: string;
  playerId: string;
  cardId: string;
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
  PLAY_CARD: "playCard",
  CREATE: "create",
  JOIN: "join",
  REJOIN: "rejoin",
  REJOIN_DATA: "rejoinData",
  DISCONNECT: "disconnectGame",
  GET_SYNC: "getSync",
  SYNC: "sync",
  ROOMS: "rooms",
  GET_ROOMS: "getRooms",
  ERROR: "gameError",
};

export interface CreateGameHandler {
  settings: GameSettings;
}

export interface GameHandler {
  gameId: string;
}

export interface JoinGameHandler {
  gameId: string;
  player: PlayerData;
}

export interface RejoinGameHandler {
  userId: string;
  gameId: string;
}

export interface RejoinData {
  userId: string;
  settings: GameSettings;
  players: Player[];
}

export interface Room {
  createdAt: Date;
  gameId: string;
  playerCount: number;
  maxPlayers: number;
  name: string;
}
