import { type Player } from "@/models/Player";
import ActionCard from "../_ActionCard";
import { CardType } from "../_CardType";
import { FavorEffect } from "../cardEffects/FavorEffect";
import { type Game } from "@/models/game/Game";

export default class Favor extends ActionCard {
  constructor() {
    const mechanics = `
    Force any other player to give you 1 card from their hand. They choose which card to give you. \n
    If you have an Exploding Kitten in your hand (see “Streaking Kitten”), you can use it as your chosen card when Favor is played on you.`;

    super(
      CardType.FAVOR,
      "Favor",
      "One player must give you a card of their choice.",
      mechanics,
    );
  }

  setUpEffects() {
    this.addEffect(new FavorEffect());
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
