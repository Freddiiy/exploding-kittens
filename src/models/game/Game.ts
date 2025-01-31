import { type Expansion } from "../expansions/_ExpansionInterface";
import { type Player } from "../Player";
import { generateRandomId } from "@/lib/generateRandomId";
import TurnManager from "./TurnManager";
import DeckManger from "./DeckManager";
import PlayerManager from "./PlayerManager";
import type BaseCard from "../cards/_BaseCard";
import type GameService from "@/services/GameService";
import { StateManager } from "./StateManager";
import { ActionManager } from "./ActionManager";
import { RequestManager } from "./RequestManager";
import { CardType } from "../cards/_CardType";
import ExplodingKitten from "../cards/ExplodingKitten";
import { DialogManager } from "./DialogManager";

export interface GameSettings {
  publicGame: boolean;
  name: string;
  expansions: Expansion[];
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

  // Managers
  private playerManager: PlayerManager;
  private deckManager: DeckManger;
  private turnManager: TurnManager;
  private stateManager: StateManager;
  private actionManager: ActionManager;
  private requestManager: RequestManager;
  private dialogManager: DialogManager;
  private winner: Player | null = null;

  constructor(
    gameSettings: GameSettings,
    maxPlayers: number = 5,
    gameService: GameService,
  ) {
    this.gameService = gameService;
    this.publicGame = gameSettings.publicGame ?? true;
    this.name = gameSettings.name ?? "A game of Exploding Kittens";
    this.expansions = gameSettings.expansions ?? [];
    this.playerManager = new PlayerManager(maxPlayers, gameService, this);
    this.deckManager = new DeckManger();
    this.turnManager = new TurnManager(this);
    this.stateManager = new StateManager();
    this.dialogManager = new DialogManager(this);
    this.requestManager = new RequestManager(this);

    this.id = generateRandomId(8);
    this.createdAt = new Date();

    // Make sure this is the latest so everything is initialized
    this.actionManager = new ActionManager(
      this,
      this.gameService,
      this.playerManager,
      this.stateManager,
    );
  }

  startGame() {
    // Need at least 2 players to start
    if (this.playerManager.getPlayers().length < 2) {
      return false;
    }

    this.turnManager.initializePlayerOrder(this.playerManager.getPlayers());
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
    if (playerId === this.turnManager.getCurrentPlayerId()) {
      this.turnManager.endTurn();
    }
  }

  async playCards(player: Player, cards: BaseCard[]) {
    await this.actionManager.playCards(player, cards);
  }

  async drawCard(player: Player) {
    if (this.actionManager.getIsNopeTimeoutActive()) {
      throw new Error("Nope timer is active");
    }

    if (!this.turnManager.canDrawCard()) {
      throw new Error("You cannot draw a card at this time");
    }

    const card = this.deckManager.drawCard();

    this.turnManager.markCardDrawn();
    this.turnManager.handleCardDrawn();

    if (card) {
      if (card.getType() === CardType.EXPLODING_KITTEN) {
        await this.handleExplodingKitten(player);
        return card;
      }
      player.addCardToHand(card);
    }
    return card;
  }

  private async handleExplodingKitten(player: Player) {
    this.gameService.sendGameState(this.id);
    const defuseCards = player
      .getHand()
      .filter((card) => card.getType() === CardType.DEFUSE);

    if (defuseCards.length > 0) {
      this.getRequestManager().broadcastMessage(
        `${player.getUsername()} has drawn an Exploding Kitten!`,
      );
      const selectedDefuseCardId =
        await this.requestManager.requestCardSelection(player, defuseCards);

      const defuseCard = player.getCardFromHand(selectedDefuseCardId);

      if (defuseCard && defuseCard.getType() === CardType.DEFUSE) {
        player.removeCardFromHand(defuseCard.getId());

        const explodingKitten = player
          .getHand()
          .find((card) => card.getType() === CardType.DEFUSE);
        if (explodingKitten) {
          player.removeCardFromHand(explodingKitten.getId());
        }
        this.getDeckManger().addToDiscardPile(defuseCard);
        const insertExplodingKittenPosition =
          await this.getRequestManager().requestInsertDefuse(player);

        this.getDeckManger().insertCard(
          new ExplodingKitten(),
          insertExplodingKittenPosition,
        );
        //this.requestManager.broadcastDefuseUsed(player);
      } else {
        // Player chose not to use a Defuse card (shouldn't happen in normal gameplay)
        await this.eliminatePlayer(player);
      }
    } else {
      await this.eliminatePlayer(player);
    }

    this.gameService.sendGameState(this.id);
  }

  private async eliminatePlayer(player: Player): Promise<void> {
    player.setIsEliminated(true);
    player.getHand().map((card) => this.deckManager.addToDiscardPile(card));
    player.setHand([]);
    this.getRequestManager().broadcastMessage(
      `${player.getUsername()} has been eleminated!`,
    );

    //await this.broadcastManager.broadcastPlayerEliminated(player);

    if (
      this.getPlayerManager()
        .getPlayers()
        .filter((x) => x.isEliminated).length === 1
    ) {
      await this.endGame(
        this.getPlayerManager()
          .getPlayers()
          .filter((x) => x.isEliminated)
          .at(0)!,
      );
    }
  }

  endGame(winner: Player) {
    this.status = "ended";
    this.winner = winner;
    setTimeout(() => {
      this.gameService.removeGame(this.id);
    }, 60000); // End game after 60 seconds
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
      //this.turnManager.endTurn();
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

  getRequestManager() {
    return this.requestManager;
  }

  sendGameState() {
    this.gameService.sendGameState(this.id);
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getGameService() {
    return this.gameService;
  }

  getDialogManager() {
    return this.dialogManager;
  }

  getActionmanager() {
    return this.actionManager;
  }
}
