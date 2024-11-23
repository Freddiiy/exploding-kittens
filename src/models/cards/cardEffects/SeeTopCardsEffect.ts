import { type Game } from "../../game/Game";
import { type Player } from "../../Player";
import { type CardEffect } from "./CardEffect";

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
