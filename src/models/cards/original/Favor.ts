import { type Player } from "@/models/Player";
import ActionCard from "../_ActionCard";
import { CardType } from "../_CardType";
import { CardEffect } from "../cardEffects/CardEffect";
import { ForcePlayerExtraTurnEffect } from "../cardEffects/ForceNextPlayerExtraTurnEffect";
import { EndTurnWithoutDrawingEffect } from "../cardEffects/EndTurnWithoutDrawingEffect";
import { FavorEffect } from "../cardEffects/FavorEffect";

export default class Favor extends ActionCard {
  constructor() {
    const mechanics = `
    Force any other player to give you 1 card from their hand. They choose which card to give you. \n \
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
}
