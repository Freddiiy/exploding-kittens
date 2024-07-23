import { type Game } from "../game/Game";
import { type Player } from "../Player";
import BaseCard from "./_BaseCard";
import { type CardEffect } from "./cardEffects/CardEffect";
import { type CardType } from "./_CardType";

export default abstract class ActionCard extends BaseCard {
  protected effects: CardEffect[] = [];
  constructor(
    type: CardType,
    name: string,
    description: string,
    mechanics: string,
  ) {
    super(type, name, description, mechanics);
    this.setUpEffects();
  }

  addEffect(effect: CardEffect) {
    this.effects.push(effect);
  }

  play(game: Game, player: Player) {
    for (const effect of this.effects) {
      effect.apply(game, player);
    }
  }

  abstract setUpEffects(): void;
}
