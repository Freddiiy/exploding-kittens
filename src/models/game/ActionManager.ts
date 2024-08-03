import type GameService from "@/services/GameService";
import type BaseCard from "../cards/_BaseCard";
import { CardType } from "../cards/_CardType";
import { type Player } from "../Player";
import { type Game } from "./Game";
import type PlayerManager from "./PlayerManager";

import { type StateManager } from "./StateManager";
import { GAME_REQUESTS } from "./RequestManager";
import CatCard from "../cards/_CatCard";

export const NOPE_TIMER = 5500;

export class ActionManager {
  private currentAction: CurrentAction | null = null;
  private nopeTimeout: NodeJS.Timeout | null = null;
  private game: Game;
  private gameService: GameService;
  private playerManager: PlayerManager;
  private stateManager: StateManager;

  constructor(
    game: Game,
    gameService: GameService,
    playerManager: PlayerManager,
    stateManager: StateManager,
  ) {
    this.game = game;
    this.gameService = gameService;
    this.playerManager = playerManager;
    this.stateManager = stateManager;
  }

  async playCard(player: Player, cards: BaseCard[]) {
    if (cards.length === 1 && cards.at(0)?.getType() === CardType.NOPE) {
      await this.handleNopeCard(player, cards.at(0)!);
    } else {
      await this.initiateAction(player, cards);
    }
  }

  private async initiateAction(player: Player, cards: BaseCard[]) {
    if (!this.game.isPlayersTurn(player)) {
      throw new Error("It's not your turn");
    }

    if (this.getNopeTimeout()) {
      throw new Error("Nope timer is active");
    }

    if (!cards.every((card) => player.hasCard(card.getId()))) {
      throw new Error("You don't have one or more of these cards");
    }

    cards.forEach((card) => player.removeCardFromHand(card.getId()));

    this.currentAction = {
      player: player,
      cards: cards,
      nopeCount: 0,
      originalPlayer: player,
    };

    this.stateManager.saveState(this.game); // Save state before action

    this.broadcastActionInitiated();

    await this.executeAction(this.currentAction);
    this.startNopeTimer();
  }

  private async handleNopeCard(player: Player, card: BaseCard) {
    if (!this.currentAction) return;

    if (!player.hasCard(card.getId())) {
      throw new Error("You don't have this Nope card");
    }

    this.currentAction.nopeCount++;
    player.removeCardFromHand(card.getId());

    // Nope is active
    if (this.currentAction.nopeCount % 2 !== 0) {
      this.cancelCurrentDialogs();
      this.stateManager.restoreState(this.game);
    } else {
      // Nope is countered (Yup)
      await this.executeAction(this.currentAction);
    }

    this.broadcastNopePlayedStatus();

    this.startNopeTimer(); // Restart the timer
  }

  private startNopeTimer() {
    if (this.nopeTimeout) {
      clearTimeout(this.nopeTimeout);
    }
    this.nopeTimeout = setTimeout(() => {
      this.resolveAction();
    }, NOPE_TIMER); // 5 seconds window for Nope cards
  }

  private resolveAction() {
    if (!this.currentAction) return;

    if (this.currentAction.nopeCount % 2 === 0) {
      // Action proceeds (final)
      this.broadcastActionResolved();
    } else {
      // Action is noped (final)
      this.broadcastActionNoped();
      this.cancelCurrentDialogs();
    }

    this.currentAction = null;
    this.nopeTimeout = null;
  }

  private async executeAction(action: NonNullable<typeof this.currentAction>) {
    try {
      if (action.cards.length === 1) {
        await action.cards.at(0)?.play(this.game, action.originalPlayer);
      } else {
        // Handle cat card combo
        await CatCard.handleCatCardCombo(
          this.game,
          action.originalPlayer,
          action.cards,
        );
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error executing action:", err);
      throw new Error("Error executing action:" + err);
    }
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
        cardType: this.currentAction?.cards.map((card) => card.getId()),
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
        cardType: this.currentAction?.cards.map((card) => card.getId()),
      });
    });
  }

  private broadcastActionResolved(): void {
    if (!this.currentAction) return;
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

      if (playerSocket) {
        playerSocket.emit("actionResolved", {
          wasNoped: this.currentAction!.nopeCount % 2 !== 0,
          playerName: this.currentAction!.originalPlayer.getUsername(),
          cardType: this.currentAction?.cards.map((card) => card.getId()),
        });
      }
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

  getNopeTimeout() {
    return this.nopeTimeout !== null;
  }
}

interface CurrentAction {
  player: Player;
  cards: BaseCard[];
  nopeCount: number;
  originalPlayer: Player;
}
