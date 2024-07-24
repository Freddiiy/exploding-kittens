import { type Expansion } from "../expansions/_ExpansionInterface";
import { type Player } from "../Player";
import { generateRandomId } from "@/lib/generateRandomId";
import TurnManager from "./TurnManger";
import DeckManger from "./DeckManger";
import PlayerManager from "./PlayerManager";

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

    const firstPlayer = this.playerManager.getPlayers().at(0);
    if (firstPlayer) {
      this.turnManager.setFirstPlayer(firstPlayer.getId());
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
      this.turnManager.nextTurn(newPlayers);
    }
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
      this.turnManager.nextTurn(this.playerManager.getPlayers());
    }
  }

  reconnectPlayer(playerId: string, newSocketId: string) {
    this.playerManager.reconnectPlayer(playerId, newSocketId);
  }

  getPlayerManager() {
    return this.playerManager;
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
