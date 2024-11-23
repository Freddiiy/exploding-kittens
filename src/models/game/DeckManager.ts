import type BaseCard from "../cards/_BaseCard";
import { BaseCardJSON } from "../cards/_BaseCard";
import { CardFactory } from "../cards/_CardFactory";
import Defuse from "../cards/Defuse";
import ExplodingKitten from "../cards/ExplodingKitten";
import Nope from "../cards/original/Nope";
import SeeTheFuture from "../cards/original/SeeTheFuture";
import { type Expansion } from "../expansions/_ExpansionInterface";
import { baseExpansion } from "../expansions/BaseDeck";
import { type Player } from "../Player";

const INITIAL_MAX_AMOUNT_OF_CARDS = 7;
export default class DeckManger {
  private deck: BaseCard[] = [];
  private discardPile: BaseCard[] = [];
  private lastDrawnCard: BaseCard | undefined = undefined;

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
      p.getHand().push(new Defuse());

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

    Array.from({ length: 50 }).forEach(() => {
      this.addCard(new SeeTheFuture());
      this.addCard(new Nope());
    });

    this.shuffle();
  }

  drawCard() {
    const drawnCard = this.deck.pop();
    this.lastDrawnCard = drawnCard;
    return drawnCard;
  }

  getLastDrawnCard() {
    return this.lastDrawnCard;
  }

  addCard(card: BaseCard) {
    this.deck.push(card);
  }

  insertCard(card: BaseCard, position: number) {
    this.deck.splice(position, 0, card);
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

  viewTopCards(n: number) {
    const deckCopy = [...this.getDeck()].slice(-n);
    return deckCopy.reverse();
  }

  private createCardFromJSON(cardData: BaseCardJSON) {
    const createdCard = CardFactory.createCard(cardData.type);
    createdCard.setId(cardData.cardId);

    return createdCard;
  }

  getState(): DeckManagerState {
    return {
      deck: this.deck.map((card) => card.toJSON()),
      discardPile: this.discardPile.map((card) => card.toJSON()),
    };
  }

  setState(state: DeckManagerState) {
    this.deck = state.deck.map((cardData) => this.createCardFromJSON(cardData));

    /* 
    this.discardPile = state.discardPile.map((cardData) =>
    this.createCardFromJSON(cardData),
    );
    */
  }
}

export interface DeckManagerState {
  deck: BaseCardJSON[];
  discardPile: BaseCardJSON[];
}
