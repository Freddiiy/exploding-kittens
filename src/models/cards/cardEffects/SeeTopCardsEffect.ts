import { type Game } from "../../game/Game";
import { Player } from "../../Player";
import { CardEffect } from "./CardEffect";

export class SeeTopCardsEffect implements CardEffect {
  numberOfCards: number;
  constructor(numberOfCards: number = 3) {
    this.numberOfCards = numberOfCards;
  }
  apply(game: Game, player: Player) {
    const viewedCards = game.getDeckManger().viewTopCards(this.numberOfCards);
    game.getRequestManager().requestViewCards(player, viewedCards);
  }
}
