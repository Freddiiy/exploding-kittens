import type BaseKittenCard from "./cards/_BaseKittenCard";
import { type ExplodingKitten } from "./cards/ExplodingKitten";

export class Player {
  name: string;
  character: string;
  handOfCards: BaseKittenCard[] = [];

  constructor(name: string, character: string) {
    this.name = name;
    this.character = character;
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
