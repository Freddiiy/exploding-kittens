import BaseCard, { type BaseCardJSON } from "@/models/cards/_BaseCard";
import { type PlayerClient } from "@/services/GameService";
import { Game } from "./Game";
import { Player } from "../Player";

export class RequestManager {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
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
      const foundCard = fromPlayer.getHand().at(cardIdx);
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

  async requestViewCards(
    fromPlayer: Player,
    toPlayer: Player,
    cards: BaseCard[],
  ) {
    const cardsJson = cards.map((card) => card.toJSON());
    await this.sendPlayerRequest(
      fromPlayer.getId(),
      GAME_REQUESTS.VIEW_DECK_CARDS,
      {
        cards: cardsJson,
      },
    );
  }

  async sendPlayerRequest<T extends keyof ClientRequestMap>(
    playerId: string,
    requestType: T,
    data?: ClientRequestMap[T]["request"],
  ) {
    return new Promise<ClientRequestMap[T]["response"]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Client request timed out"));
      }, 120000); // 120 seconds timeout

      this.game
        .getGameService()
        .sendRequest(
          playerId,
          requestType,
          data,
          (response: ClientRequestMap[T]["response"]) => {
            clearTimeout(timeout);
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

export const GAME_REQUESTS = {
  PICK_CARD: "pickCard",
  SELECT_CARD: "selectCard",
  GIVE_CARD: "giveCard",
  CHOOSE_PLAYER: "choosePlayer",
  CANCEL_DIALOG: "cancelDialogs",
  VIEW_DECK_CARDS: "viewDeckCards",
} as const;

export interface ClientRequestMap {
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
}
