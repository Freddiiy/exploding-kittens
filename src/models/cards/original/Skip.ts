import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import ActionCard from "../_ActionCard";
import { CardType } from "../_CardType";
import { CardEffect } from "../cardEffects/CardEffect";
import { ForceNextPlayerExtraTurnEffect } from "../cardEffects/ForceNextPlayerExtraTurnEffect";
import { EndTurnWithoutDrawingEffect } from "../cardEffects/EndTurnWithoutDrawingEffect";

export default class Nope extends ActionCard {
  constructor() {
    const mechanics = `If you play a Skip Card as a defense to an Attack Card, it only ends 1 of the 2 turns. 2 Skip Cards would end both turns.`;

    super(
      CardType.NOPE,
      "Nope",
      "End your turn without drawing a card.",
      mechanics,
    );
  }

  setUpEffects() {
    this.addEffect(new EndTurnWithoutDrawingEffect());
  }
}