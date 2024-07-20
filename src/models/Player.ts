import { z } from "zod";
import type BaseKittenCard from "./cards/_BaseKittenCard";
import { ExplodingKitten } from "./cards/ExplodingKitten";

export const playerOtionsSchema = z.object({
  playerId: z.string().min(16).max(16),
  name: z.string().min(3),
  character: z.string(),
});
export type PlayerOptions = z.infer<typeof playerOtionsSchema>;
export class Player {
  playerId: string;
  name: string;
  character: string;
  handOfCards: BaseKittenCard[] = [];

  constructor(playerOptions: PlayerOptions) {
    this.playerId = playerOptions.playerId;
    this.name = playerOptions.name;
    this.character = playerOptions.character;
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
