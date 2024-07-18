import { type Expansion } from "./expansions/_ExpansionInterface";
import type BaseKittenCard from "./cards/_BaseKittenCard";
import { type Player } from "./Player";
import { baseExpansion } from "./expansions/BaseDeck";

export default class GameState {
  deck: BaseKittenCard[] = [];
  discardPile: BaseKittenCard[] = [];
  players: Player[] = [];
  activePlayerIndex = 0;

  constructor(selectedExpansions: Expansion[]) {
    this.initialize(selectedExpansions);
  }

  initialize(selectedExpansions: Expansion[]) {
    const expansions = [baseExpansion, ...selectedExpansions];

    expansions.forEach((exp) => {
      exp.forEach(({ card, amount }) => {
        Array.from(Array(amount).keys()).forEach(() => {
          this.deck.push(card);
        });
      });
    });

    this.shuffle();
  }

  //Fisher-Yates shuffle algo
  shuffle() {
    this.deck.forEach((_, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      if (this.deck[i] && this.deck[j]) {
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    });
  }
}
