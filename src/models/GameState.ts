import { type Expansion } from "./expansions/_ExpansionInterface";
import type BaseKittenCard from "./cards/_BaseKittenCard";
import { type Player } from "./Player";
import { baseExpansion } from "./expansions/BaseDeck";
import { KittenCardEnum } from "./cards/_CardFactory";
import { Defuse } from "./cards/Defuse";

const MAX_AMOUNT_OF_CARDS = 7;

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

    expansions.forEach((exps) => {
      exps.deck.forEach(({ cardType, amount }) => {
        Array.from(Array(amount).keys()).forEach(() => {
          //TODO: ADD CARD FACTORY
          this.deck.push();
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

  dealCards() {
    this.players.forEach((p) => {
      p.handOfCards.push(new Defuse());
      Array.from(Array(MAX_AMOUNT_OF_CARDS).keys()).forEach(() => {
        const drawnCard = this.deck.pop();
        if (drawnCard) {
          p.handOfCards.push(drawnCard);
        }
      });
    });
  }
}
