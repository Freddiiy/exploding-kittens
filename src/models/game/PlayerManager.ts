import BaseCard from "../cards/_BaseCard";
import { type Player } from "../Player";
import GameService, { PlayerClient } from "../../services/GameService";

export default class PlayerManager {
  private gameService: GameService;
  private players: Player[];
  private maxPlayers;
  private disconnectedPlayers: Map<string, Player> = new Map();

  constructor(maxPlayers: number = 5, gameService: GameService) {
    this.players = [];
    this.maxPlayers = maxPlayers;
    this.gameService = gameService;
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

  async selectPlayer(currentPlayer: Player) {
    const otherPlayers = this.players.filter((p) => p !== currentPlayer);
    // This would typically involve sending a request to the client and waiting for a response
    // For now, we'll just return the first other player
    return otherPlayers.at(0) ?? null;
  }

  async selectCardFromPlayer(fromPlayer: Player, toPlayer: Player) {
    const res = await this.sendPlayerRequest(
      fromPlayer.getId(),
      GAME_REQUESTS.SELECT_CARD,
    );

    const cardIdx = res.selectedCardIndex;

    if (
      cardIdx !== null &&
      cardIdx >= 0 &&
      cardIdx < fromPlayer.getHandSize()
    ) {
      const foundCard = fromPlayer.getHandOfCard().at(cardIdx);
      if (!foundCard) {
        throw new Error("No card found");
      }

      const selectedCard = fromPlayer.getCardFromHand(foundCard.getId());
      return selectedCard;
    }

    return null;
  }
  async sendPlayerRequest<T extends keyof ClientRequestMap>(
    playerId: string,
    requestType: T,
    data?: ClientRequestMap[T]["request"],
  ) {
    return new Promise<ClientRequestMap[T]["response"]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Client request timed out"));
      }, 30000); // 30 seconds timeout

      this.gameService.sendRequest(
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

  async choosePlayer(currentPlayer: Player) {
    try {
      const otherPlayers = this.getPlayers().filter((p) => p !== currentPlayer);
      const response = await this.sendPlayerRequest(
        currentPlayer.getId(),
        GAME_REQUESTS.CHOOSE_PLAYER,
        {
          availablePlayers: otherPlayers.map((p) => p.toPlayerClient()),
        },
      );

      return this.getPlayerById(response.selectedPlayerId) ?? null;
    } catch (error) {
      console.error("Error choosing player:", error);
    }
    return null;
  }

  transferCard(fromPlayer: Player, toPlayer: Player, card: BaseCard): void {
    fromPlayer.removeCardFromHand(card.getId());
    toPlayer.addCardToHand(card);
  }
}

export interface SelectCardRequest {
  handSize: number;
}

export interface SelectCardResponse {
  selectedCardIndex: number;
}

export interface GiveCardRequest {
  handSize: number;
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

export const GAME_REQUESTS = {
  SELECT_CARD: "selectCard",
  GIVE_CARD: "giveCard",
  CHOOSE_PLAYER: "choosePlayer",
} as const;

export interface ClientRequestMap {
  [GAME_REQUESTS.SELECT_CARD]: {
    request: SelectCardRequest;
    response: SelectCardResponse;
  };
  [GAME_REQUESTS.GIVE_CARD]: {
    request: GiveCardRequest;
    response: GiveCardResponse;
  };
  [GAME_REQUESTS.CHOOSE_PLAYER]: {
    request: ChoosePlayerRequest;
    response: ChoosePlayerResponse;
  };
}
