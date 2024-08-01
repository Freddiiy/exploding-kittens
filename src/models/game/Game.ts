import { type Expansion } from "../expansions/_ExpansionInterface";
import { type Player } from "../Player";
import { generateRandomId } from "@/lib/generateRandomId";
import TurnManager from "./TurnManager";
import DeckManger from "./DeckManager";
import PlayerManager, { GAME_REQUESTS } from "./PlayerManager";
import type BaseCard from "../cards/_BaseCard";
import type GameService from "@/services/GameService";
import { CardType } from "../cards/_CardType";
import { StateManager } from "./StateManager";

export interface GameSettings {
  publicGame: boolean;
  name: string;
  expansions: Expansion[];
}

interface CurrentAction {
  player: Player;
  card: BaseCard;
  nopeCount: number;
  originalPlayer: Player;
}

export type GameStatus = "waiting" | "inProgress" | "ended";
export class Game {
  private gameService: GameService;
  private createdAt: Date;

  private id: string;

  // Settings
  private status: GameStatus = "waiting";
  private publicGame: boolean;
  private name: string;
  private expansions: Expansion[] = [];

  // Actions for nope
  private currentAction: CurrentAction | null = null;
  private nopeTimeout: NodeJS.Timeout | null = null;

  // Managers
  private playerManager: PlayerManager;
  private deckManager: DeckManger;
  private turnManager: TurnManager;
  private stateManager: StateManager;

  constructor(
    gameSettings: GameSettings,
    maxPlayers: number = 5,
    gameService: GameService,
  ) {
    this.gameService = gameService;
    this.publicGame = gameSettings.publicGame ?? true;
    this.name = gameSettings.name ?? "A game of Exploding Kittens";
    this.expansions = gameSettings.expansions ?? [];
    this.playerManager = new PlayerManager(maxPlayers, gameService);
    this.deckManager = new DeckManger();
    this.turnManager = new TurnManager();
    this.stateManager = new StateManager();

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
      ? (this.playerManager
          .getPlayers()
          .find((p) => p.getId() === currentPlayerId) ?? null)
      : null;
  }

  removePlayer(playerId: string) {
    const newPlayers = this.playerManager.removePlayer(playerId);
    if (playerId === this.turnManager.getCurrentPlayerId()) {
      this.turnManager.endTurn(newPlayers);
    }
  }

  async playCard(player: Player, card: BaseCard) {
    if (card.getType() === CardType.NOPE) {
      this.handleNopeCard(player, card);
    } else {
      await this.initiateAction(player, card);
    }
  }

  private async initiateAction(player: Player, card: BaseCard) {
    if (!this.isPlayersTurn(player)) {
      throw new Error("It's not your turn");
    }

    this.currentAction = {
      player: player,
      card: card,
      nopeCount: 0,
      originalPlayer: player,
    };

    this.stateManager.saveState(this);

    this.broadcastActionInitiated();
    this.startNopeTimer();
    player.removeCardFromHand(card.getId());
    await card.play(this, this.currentAction.originalPlayer);
  }

  private handleNopeCard(player: Player, card: BaseCard) {
    // Nope played when no action is in progress
    if (!this.currentAction) {
      return;
    }

    this.cancelCurrentDialogs();
    if (this.currentAction.nopeCount % 2 !== 0) {
    }

    this.currentAction.nopeCount++;
    this.currentAction.player = this.currentAction.originalPlayer;

    console.log("NOPE COUNT: ", this.currentAction.nopeCount);
    this.broadcastNopePlayedStatus();

    if (this.nopeTimeout) {
      clearTimeout(this.nopeTimeout);
    }
    this.startNopeTimer();

    this.currentAction.card.play(this, this.currentAction.originalPlayer);
    player.removeCardFromHand(card.getId());
  }

  private startNopeTimer() {
    this.nopeTimeout = setTimeout(() => {
      this.resolveAction();
    }, 5000); // 5 seconds window for Nope cards
  }

  private resolveAction() {
    if (!this.currentAction) return;

    if (this.currentAction.nopeCount % 2 === 0) {
      // Action proceeds
      this.stateManager.popState();
    } else {
      // Action is noped
      this.broadcastActionNoped();
    }

    this.currentAction = null;
  }

  private broadcastActionInitiated() {
    // Emit event to all players about the initiated action
    this.playerManager.getPlayers().forEach((player) => {
      const playerSocketId = player.getSocketId();
      if (!playerSocketId) {
        throw new Error("No socket ID found on " + player.getUsername());
      }

      const playerSocket = this.gameService
        .getIO()
        .sockets.sockets.get(playerSocketId);

      if (!playerSocket) {
        throw new Error("No socket found on " + player.getUsername());
      }

      playerSocket.emit("actionInitiated", {
        playerName: this.currentAction?.player.getUsername(),
        cardType: this.currentAction?.card.getType(),
      });
    });
  }

  private broadcastNopePlayedStatus() {
    // Emit event to all players about the current Nope status
    this.playerManager.getPlayers().forEach((player) => {
      const playerSocketId = player.getSocketId();
      if (!playerSocketId) {
        throw new Error("No socket ID found on " + player.getUsername());
      }

      const playerSocket = this.gameService
        .getIO()
        .sockets.sockets.get(playerSocketId);

      if (!playerSocket) {
        throw new Error("No socket found on " + player.getUsername());
      }

      playerSocket.emit("nopeStatusUpdate", {
        nopeCount: this.currentAction?.nopeCount,
        isNoped: this.currentAction!.nopeCount % 2 !== 0,
      });
    });
  }

  private broadcastActionNoped() {
    // Emit event to all players that the action was ultimately noped
    this.playerManager.getPlayers().forEach((player) => {
      const playerSocketId = player.getSocketId();
      if (!playerSocketId) {
        throw new Error("No socket ID found on " + player.getUsername());
      }

      const playerSocket = this.gameService
        .getIO()
        .sockets.sockets.get(playerSocketId);

      if (!playerSocket) {
        throw new Error("No socket found on " + player.getUsername());
      }

      playerSocket.emit("actionNoped", {
        playerName: this.currentAction?.player.getUsername(),
        cardType: this.currentAction?.card.getType(),
      });
    });
  }

  private cancelCurrentDialogs() {
    // Emit an event to all players to close their dialogs
    this.playerManager.getPlayers().forEach((player) => {
      const playerSocketId = player.getSocketId();
      if (!playerSocketId) {
        throw new Error("Player socket id not found");
      }
      const playerSocket = this.gameService
        .getIO()
        .sockets.sockets.get(playerSocketId);
      if (playerSocket) {
        playerSocket.emit(GAME_REQUESTS.CANCEL_DIALOG);
      }
    });
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

  sendGameState() {
    this.gameService.sendGameState(this.id);
  }

  getCreatedAt() {
    return this.createdAt;
  }
}
