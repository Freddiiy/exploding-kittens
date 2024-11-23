import { type BaseCardJSON } from "../cards/_BaseCard";
import type BaseCard from "../cards/_BaseCard";
import { type Player } from "../Player";
import { type PlayerClient } from "../../services/GameService";
import type GameService from "../../services/GameService";
import { type Game } from "./Game";

export default class PlayerManager {
  private gameService: GameService;
  private game: Game;
  private players: Player[];
  private maxPlayers;
  private disconnectedPlayers: Map<string, Player> = new Map();

  constructor(maxPlayers: number = 5, gameService: GameService, game: Game) {
    this.players = [];
    this.maxPlayers = maxPlayers;
    this.gameService = gameService;
    this.game = game;
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) {
      return false; // Game is full
    }
    this.players.push(player);
    return true;
  }

  getPlayers() {
    // returns a copy to prevent modifications to array
    return [...this.players];
  }

  getPlayerById(playerId: string) {
    return this.players.find((player) => player.getId() === playerId);
  }

  getMaxPlayers() {
    return this.maxPlayers;
  }

  removePlayer(playerId: string) {
    const index = this.players.findIndex((p) => p.getId() === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }

    return this.getPlayers();
  }

  disconnectPlayer(playerId: string) {
    const player = this.players.find((p) => p.getId() === playerId);
    if (player) {
      this.players = this.players.filter((p) => p.getId() !== playerId);
      this.disconnectedPlayers.set(player.getId(), player);
    }
  }

  reconnectPlayer(playerId: string, newSocketId: string) {
    let player = this.disconnectedPlayers.get(playerId);
    if (player) {
      player.setSocketId(newSocketId);
      this.players.push(player);
      const dialogState = this.game
        .getDialogManager()
        .getDialogState(player.getId());

      if (dialogState) {
        this.game
          .getRequestManager()
          .sendPlayerRequest(
            playerId,
            dialogState.requestType,
            dialogState.data,
          );
      }
      this.disconnectedPlayers.delete(playerId);
      return player;
    }

    player = this.players.find((p) => p.getId() === playerId);
    if (player) {
      player.setSocketId(newSocketId);
    } else {
      return null;
    }

    return player;
  }

  isPlayerDisconnected(playerId: string): boolean {
    return this.disconnectedPlayers.has(playerId);
  }

  transferCard(fromPlayer: Player, toPlayer: Player, card: BaseCard): void {
    fromPlayer.removeCardFromHand(card.getId());
    toPlayer.addCardToHand(card);
  }
}
