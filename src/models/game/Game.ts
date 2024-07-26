import { type Expansion } from "../expansions/_ExpansionInterface";
import { type Player } from "../Player";
import { generateRandomId } from "@/lib/generateRandomId";
import TurnManager from "./TurnManger";
import DeckManger from "./DeckManger";
import PlayerManager from "./PlayerManager";
import BaseCard from "../cards/_BaseCard";

export interface GameSettings {
  publicGame: boolean;
  name: string;
  expansions: Expansion[];
}

export type GameStatus = "waiting" | "inProgress" | "ended";
export class Game {
  private createdAt: Date;

  private id: string;

  private status: GameStatus = "waiting";
  private publicGame: boolean;
  private name: string;
  private expansions: Expansion[] = [];

  private playerManager: PlayerManager;
  private deckManager: DeckManger;
  private turnManager: TurnManager;

  constructor(gameSettings: GameSettings, maxPlayers: number = 5) {
    this.publicGame = gameSettings.publicGame ?? true;
    this.name = gameSettings.name ?? "A game of Exploding Kittens";
    this.expansions = gameSettings.expansions ?? [];

    this.playerManager = new PlayerManager(maxPlayers);
    this.deckManager = new DeckManger();
    this.turnManager = new TurnManager();

    this.id = generateRandomId(8);
    this.createdAt = new Date();
  }

  startGame() {
    // Need at least 2 players to start
    if (this.playerManager.getPlayers().length < 2) {
      return false;
    }

    this.turnManager.initializePlayerOrder(this.playerManager.getPlayers());
    //TODO: Add additional locic: game start logic, deal cards etc
    this.deckManager.initDeck(this.getExpansions());
    this.deckManager.dealCards(this.playerManager.getPlayers());
    const players = this.playerManager.getPlayers();
    if (players.length > 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      const randomPlayer = players[randomIndex];
      if (randomPlayer) {
        this.turnManager.setFirstPlayer(randomPlayer.getId());
      } else {
        // This case should theoretically never happen if players.length > 0 but we make TypeScript shut up.
        console.error("Selected player is undefined despite players existing");
        this.turnManager.setFirstPlayer(players[0]!.getId());
      }
    } else {
      throw new Error("Cannot start game with no players");
    }

    this.status = "inProgress";
    return true;
  }

  addPlayer(player: Player): boolean {
    const isAdded = this.playerManager.addPlayer(player);
    if (isAdded && this.turnManager.getCurrentPlayerId() === null) {
      // First player to join starts
      this.turnManager.setCurrentPlayerId(player.getId());
    }
    return true;
  }

  getCurrentPlayer(): Player | null {
    const currentPlayerId = this.turnManager.getCurrentPlayerId();
    return currentPlayerId
      ? this.playerManager
          .getPlayers()
          .find((p) => p.getId() === currentPlayerId) || null
      : null;
  }

  removePlayer(playerId: string) {
    const newPlayers = this.playerManager.removePlayer(playerId);
    if (playerId === this.turnManager.getCurrentPlayerId()) {
      this.turnManager.endTurn(newPlayers);
    }
  }

  async playCard(player: Player, card: BaseCard) {
    if (!this.isPlayersTurn(player)) {
      throw new Error("It's not your turn");
    }

    await card.play(this, player);
    this.nextTurn();
  }

  async nextTurn() {
    this.turnManager.endTurn(this.playerManager.getPlayers());
  }

  isFull() {
    return (
      this.playerManager.getPlayers().length >=
      this.playerManager.getMaxPlayers()
    );
  }

  getStatus() {
    return this.status;
  }

  isStarted() {
    return this.status === "inProgress";
  }

  isPlayersTurn(player: Player) {
    return this.turnManager.getCurrentPlayerId() === player.getId();
  }

  getId(): string {
    return this.id;
  }

  isPublic() {
    return this.publicGame;
  }

  getExpansions() {
    return this.expansions;
  }

  getName() {
    return this.name;
  }

  disconnectPlayer(playerId: string) {
    this.playerManager.disconnectPlayer(playerId);
    if (playerId === this.turnManager.getCurrentPlayerId()) {
      this.turnManager.endTurn(this.playerManager.getPlayers());
    }
  }

  reconnectPlayer(playerId: string, newSocketId: string) {
    this.playerManager.reconnectPlayer(playerId, newSocketId);
  }

  getPlayerManager() {
    return this.playerManager;
  }
  isPlayerGameHost(playerId: string) {
    return this.playerManager.getPlayers().at(0)?.getId() === playerId;
  }

  getDeckManger() {
    return this.deckManager;
  }

  getTurnManger() {
    return this.turnManager;
  }

  getCreatedAt() {
    return this.createdAt;
  }
}
