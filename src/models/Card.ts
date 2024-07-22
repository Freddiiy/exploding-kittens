import type BaseCard from "./cards/_BaseCard";

export default class Deck {
  private cards: BaseCard[] = [];

  addCard(card: BaseCard) {
    this.cards.push(card);
  }

  toJSON() {
    return this.cards.map((card) => card.toJSON());
  }
}
