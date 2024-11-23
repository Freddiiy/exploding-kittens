import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import ActionCard from "../_ActionCard";
import { CardType } from "../_CardType";
import { SeeTopCardsEffect } from "../cardEffects/SeeTopCardsEffect";

export default class SeeTheFuture extends ActionCard {
  constructor() {
    const mechanics = `Privately view the top 3 cards from the Draw Pile and put them back in the same order. Don’t show the cards to the other players.`;

    super(
      CardType.SEE_THE_FUTURE,
      "See The Future",
      "Privately view the top three (3) cards of the deck.",
      mechanics,
    );
  }

  setUpEffects() {
    this.addEffect(new SeeTopCardsEffect(3));
  }

  /**
   * Overwrites the default play function to resolve after nope timer has run.
   */
  async play(game: Game, player: Player) {
    for (const effect of this.effects) {
      game
        .getActionmanager()
        .addNopeTimerCallback(() => effect.apply(game, player));
    }
  }
}
