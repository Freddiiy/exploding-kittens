import { z } from "zod";
import type BaseKittenCard from "./cards/_BaseKittenCard";
import { ExplodingKitten } from "./cards/ExplodingKitten";

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
  username: string;
  avatar: string;
  handOfCards: BaseKittenCard[] = [];

  constructor(playerOptions: PlayerData) {
    this.username = playerOptions.username;
    this.avatar = playerOptions.avatar;
  }

  drawCard(deck: ExplodingKitten[]) {
    if (deck.length > 0) {
      const drawnCard = deck.pop();
      if (drawnCard) {
        this.handOfCards.push(drawnCard);
        return drawnCard;
      }
    }
  }

  playCard(cardType: string) {
    const cardIndex = this.handOfCards.findIndex(
      (card) => card.type === cardType,
    );
    return this.handOfCards.splice(cardIndex, 1).at(0);
  }
}
