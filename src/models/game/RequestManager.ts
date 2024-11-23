import type BaseCard from "@/models/cards/_BaseCard";
import { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { GAME_ACTIONS, type PlayerClient } from "@/services/GameService";
import { type Game } from "./Game";
import { type Player } from "../Player";
import { Inter } from "next/font/google";
import { type insertOptions } from "@/components/insert-position-dialog";

export class RequestManager {
  private game: Game;
  constructor(game: Game) {
    this.game = game;
  }

  //TODO: Implement defuse broadcast

  broadcastMessage(
    message: string,
    toPlayers: Player[] = this.game.getPlayerManager().getPlayers(),
  ) {
    const io = this.game.getGameService().getIO();

    toPlayers.forEach((player) => {
      this.sendPlayerRequest(player.getId(), GAME_REQUESTS.BROADCAST_MESSAGE, {
        message,
      });
    });
  }
  broadcastDefuseUsed(player: Player) {
    throw new Error("Method not implemented.");
  }
  async requestCardSelection(player: Player, cards: BaseCard[]) {
    const res = await this.sendPlayerRequest(
      player.getId(),
      GAME_REQUESTS.GIVE_CARD,
      { availableCards: cards.map((card) => card.toJSON()) },
    );

    return res.cardId;
  }

  async requestInsertDefuse(player: Player) {
    const pos = await this.sendPlayerRequest(
      player.getId(),
      GAME_REQUESTS.INSERT_DEFUSE,
      {
        deckAmount: this.game.getDeckManger().getDeck().length,
      },
    );

    switch (pos.insertPosition) {
      case "Top":
        return 0;
      case "Second":
        return 1;
      case "Third":
        return 2;
      case "Forth":
        return 3;
      case "Fifth":
        return 4;
      case "Bottom":
        return this.game.getDeckManger().getDeckSize() - 1;
      case "Random":
        return Math.floor(
          Math.random() * this.game.getDeckManger().getDeckSize(),
        );
      default:
        return Math.floor(
          Math.random() * this.game.getDeckManger().getDeckSize(),
        );
    }
  }

  async requestPickCardFromPlayer(fromPlayer: Player, toPlayer: Player) {
    const res = await this.sendPlayerRequest(
      toPlayer.getId(),
      GAME_REQUESTS.PICK_CARD,
      { handSize: fromPlayer.getHandSize() },
    );

    const cardIdx = res.selectedCardIndex;

    if (
      cardIdx !== null &&
      cardIdx >= 0 &&
      cardIdx < fromPlayer.getHandSize()
    ) {
      const playerHand = fromPlayer.getHand();
      const shuffled = this.game.getDeckManger().shuffle(playerHand);
      const foundCard = shuffled.at(cardIdx);
      if (!foundCard) {
        throw new Error("No card found");
      }

      const selectedCard = fromPlayer.getCardFromHand(foundCard.getId());

      if (!selectedCard) {
        throw new Error(
          "Card not found on " + fromPlayer.getUsername() + "'s hand",
        );
      }
      this.game
        .getPlayerManager()
        .transferCard(fromPlayer, toPlayer, selectedCard);
    }
  }

  async requestGiveCardToPlayer(fromPlayer: Player, toPlayer: Player) {
    const res = await this.sendPlayerRequest(
      fromPlayer.getId(),
      GAME_REQUESTS.GIVE_CARD,
      {
        availableCards: fromPlayer.getHand().map((card) => card.toJSON()),
      },
    );

    const card = fromPlayer.getCardFromHand(res.cardId);

    if (!card) {
      throw new Error(
        "Card not found on " + fromPlayer.getUsername() + "'s hand",
      );
    }

    this.game.getPlayerManager().transferCard(fromPlayer, toPlayer, card);
  }

  async requestViewCards(fromPlayer: Player, cards: BaseCard[]) {
    const cardsJson = cards.map((card) => card.toJSON());
    await this.sendPlayerRequest(
      fromPlayer.getId(),
      GAME_REQUESTS.VIEW_DECK_CARDS,
      {
        cards: cardsJson,
      },
    );
  }

  async broadcastExplodingKittenDrawn(byPlayer: Player) {
    const allPlayers = this.game.getPlayerManager().getPlayers();

    allPlayers.forEach((player) => {
      this.sendPlayerRequest(
        player.getId(),
        GAME_REQUESTS.BROADCAST_EXPLODING_KITTEN,
        {
          byPlayer: byPlayer.toPlayerClient(),
        },
      );
    });
  }

  async sendPlayerRequest<T extends keyof ClientRequestMap>(
    playerId: string,
    requestType: T,
    data?: ClientRequestMap[T]["request"],
  ) {
    this.game.getDialogManager().openDialog(playerId, requestType, data);
    return new Promise<ClientRequestMap[T]["response"]>((resolve, reject) => {
      /* 
      const timeout = setTimeout(() => {
        this.game.getDialogManager().closeDialog(playerId);
        reject(new Error("Client request timed out"));
      }, 120000); // 120 seconds timeout
      
      */
      this.game
        .getGameService()
        .sendRequest(
          playerId,
          requestType,
          data,
          (response: ClientRequestMap[T]["response"]) => {
            //clearTimeout(timeout);
            this.game.getDialogManager().closeDialog(playerId);
            resolve(response);
          },
        );
    });
  }

  async requestChoosePlayer(currentPlayer: Player) {
    try {
      const otherPlayers = this.game
        .getPlayerManager()
        .getPlayers()
        .filter((p) => p !== currentPlayer);
      const response = await this.sendPlayerRequest(
        currentPlayer.getId(),
        GAME_REQUESTS.CHOOSE_PLAYER,
        {
          availablePlayers: otherPlayers.map((p) => p.toPlayerClient()),
        },
      );

      return (
        this.game.getPlayerManager().getPlayerById(response.selectedPlayerId) ??
        null
      );
    } catch (error) {
      console.error("Error choosing player:", error);
    }
    return null;
  }
}
export interface PickCardRequest {
  handSize: number;
}

export interface PickCardResponse {
  selectedCardIndex: number;
}

export interface GiveCardRequest {
  availableCards: BaseCardJSON[];
}

export interface GiveCardResponse {
  cardId: string;
}

export interface ChoosePlayerRequest {
  availablePlayers: PlayerClient[];
}

export interface ChoosePlayerResponse {
  selectedPlayerId: string;
}

export interface ViewDeckCardRequest {
  cards: BaseCardJSON[];
}

export interface BroadcastMessage {
  message: string;
}

export interface BroadcastExplodingKittenRequest {
  byPlayer: PlayerClient;
}

export interface BroadcastExplodingKittenResponse {
  defuse: BaseCardJSON;
}

export interface InsertCardRequest {
  deckAmount: number;
}

export interface InsertCardResponse {
  insertPosition: (typeof insertOptions)[number];
}

export type GAME_REQUEST = (typeof GAME_REQUESTS)[keyof typeof GAME_REQUESTS];
export const GAME_REQUESTS = {
  OPEN_DIALOG: "openDialog",
  BROADCAST_EXPLODING_KITTEN: "broadcastExplodingKitten",
  SELECT_DEFUSE: "selectDefuse",
  SELECT_CARD: "selectCard",
  PICK_CARD: "pickCard",
  GIVE_CARD: "giveCard",
  CHOOSE_PLAYER: "choosePlayer",
  CANCEL_DIALOG: "cancelDialogs",
  VIEW_DECK_CARDS: "viewDeckCards",
  INSERT_DEFUSE: "insertDefuse",
  BROADCAST_MESSAGE: "broadcastMessage",
} as const;

export interface ClientRequestMap {
  [GAME_REQUESTS.INSERT_DEFUSE]: {
    request: InsertCardRequest;
    response: InsertCardResponse;
  };
  [GAME_REQUESTS.BROADCAST_EXPLODING_KITTEN]: {
    request: BroadcastExplodingKittenRequest;
    response: BroadcastExplodingKittenResponse;
  };

  [GAME_REQUESTS.PICK_CARD]: {
    request: PickCardRequest;
    response: PickCardResponse;
  };
  [GAME_REQUESTS.GIVE_CARD]: {
    request: GiveCardRequest;
    response: GiveCardResponse;
  };
  [GAME_REQUESTS.CHOOSE_PLAYER]: {
    request: ChoosePlayerRequest;
    response: ChoosePlayerResponse;
  };

  [GAME_REQUESTS.VIEW_DECK_CARDS]: {
    request: ViewDeckCardRequest;
    response: void;
  };

  [GAME_REQUESTS.BROADCAST_MESSAGE]: {
    request: BroadcastMessage;
    response: void;
  };
}
