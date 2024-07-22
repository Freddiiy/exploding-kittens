import { type Game } from "../Game";
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
  }

  addEffect(effect: CardEffect) {
    this.effects.push(effect);
  }

  play(game: Game, player: Player) {
    this.action(game, player);
  }

  protected beforeAction(game: Game, player: Player): void {}
  protected abstract action(game: Game, player: Player): void;
  protected afterAction(game: Game, player: Player): void {}
}
