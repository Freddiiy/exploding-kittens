import { z } from "zod";
import type BaseCard from "./cards/_BaseCard";
import { PlayerClient } from "@/services/GameService";

export const playerOtionsSchema = z.object({
  userId: z.string().min(16).max(16),
  username: z.string().min(3),
  avatar: z.string(),
});
export interface PlayerData {
  userId: string;
  username: string;
  avatar: string;
}

export class Player {
  private userId: string;
  private socketId: string | null = null;
  private username: string;
  private avatar: string;
  private handOfCards: BaseCard[] = [];
  private lastPlayedCard: BaseCard | null = null;

  constructor(playerOptions: PlayerData) {
    this.userId = playerOptions.userId;
    this.username = playerOptions.username;
    this.avatar = playerOptions.avatar;
  }

  getId() {
    return this.userId;
  }

  getSocketId() {
    return this.socketId;
  }

  setSocketId(socketId: string): void {
    this.socketId = socketId;
  }

  getUsername() {
    return this.username;
  }

  getAvatar() {
    return this.avatar;
  }

  getHandOfCard() {
    return this.handOfCards;
  }

  getHandSize() {
    return this.getHandOfCard().length;
  }

  addCardToHand(card: BaseCard) {
    this.handOfCards.push(card);
  }

  getCardFromHand(cardId: string) {
    return this.handOfCards.find((card) => card.getId() === cardId);
  }

  getLastPlayedCard() {
    return this.lastPlayedCard;
  }

  setLastPlayCard(card: BaseCard) {
    this.lastPlayedCard = card;
  }

  removeCardFromHand(cardId: string) {
    this.handOfCards = this.handOfCards.filter(
      (card) => card.getId() !== cardId,
    );
  }

  toPlayerClient(isCurrentTurn = false) {
    const playerClient: PlayerClient = {
      id: this.getId(),
      username: this.getUsername(),
      avatar: this.getAvatar(),
      handSize: this.getHandOfCard().length,
      lastPlayedCard: this.getLastPlayedCard()?.toJSON() ?? null,
    };

    return playerClient;
  }
}
