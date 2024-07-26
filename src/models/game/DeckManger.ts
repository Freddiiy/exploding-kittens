import type BaseCard from "../cards/_BaseCard";
import { CardFactory } from "../cards/_CardFactory";
import Defuse from "../cards/Defuse";
import ExplodingKitten from "../cards/ExplodingKitten";
import { type Expansion } from "../expansions/_ExpansionInterface";
import { baseExpansion } from "../expansions/BaseDeck";
import { type Player } from "../Player";

const INITIAL_MAX_AMOUNT_OF_CARDS = 7;
export default class DeckManger {
  private deck: BaseCard[] = [];
  private discardPile: BaseCard[] = [];

  initDeck(expansions: Expansion[]) {
    expansions.forEach((exps) => {
      exps.deck.forEach(({ cardType, amount }) => {
        Array.from(Array(amount).keys()).forEach(() => {
          const newCard = CardFactory.createCard(cardType);
          this.deck.push(newCard);
        });
      });
    });

    this.shuffle();
  }

  //Fisher-Yates shuffle algo
  shuffle() {
    this.deck.forEach((_, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      if (this.deck[i] !== undefined && this.deck[j] !== undefined) {
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    });
  }

  dealCards(players: Player[]) {
    players.forEach((p) => {
      p.getHandOfCard().push(new Defuse());

      Array.from(Array(INITIAL_MAX_AMOUNT_OF_CARDS).keys()).forEach(() => {
        const drawnCard = this.drawCard();
        if (drawnCard) {
          p.addCardToHand(drawnCard);
        }
      });
    });

    const explodingKittenCount = players.length - 1;
    Array.from(Array(explodingKittenCount).keys()).forEach(() => {
      this.addCard(new ExplodingKitten());
    });

    this.shuffle();
  }

  drawCard() {
    return this.deck.pop();
  }

  addCard(card: BaseCard) {
    this.deck.push(card);
  }

  getDeck() {
    return this.deck;
  }

  getDeckSize() {
    return this.deck.length;
  }

  getDiscardPile() {
    return [...this.discardPile];
  }

  addToDiscardPile(card: BaseCard) {
    this.discardPile.push(card);
  }
}
