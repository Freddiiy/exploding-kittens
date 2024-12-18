import { type Player } from "@/models/Player";
import ActionCard from "../_ActionCard";
import { CardType } from "../_CardType";
import { CardEffect } from "../cardEffects/CardEffect";
import { ForcePlayerExtraTurnEffect } from "../cardEffects/ForceNextPlayerExtraTurnEffect";
import { EndTurnWithoutDrawingEffect } from "../cardEffects/EndTurnWithoutDrawingEffect";

export default class Attack extends ActionCard {
  constructor() {
    const mechanics = `Do not draw any cards. Instead, immediately force the next player to take 2 turns in a row. Play then continues from that player. The victim of this card takes a turn as normal (pass-or-play then draw). Then, when their first turn is over, it's their turn again. \n \ 
    If the victim of an Attack Card plays an Attack Card on any of their turns, the new target must take any remaining turns plus the number of attacks on the Attack Card just played (e.g. 4 turns, then 6, and so on).`;

    super(
      CardType.ATTACK,
      "Attack",
      "End your turn without drawing a card. Force the next player to take two turns.",
      mechanics,
    );
  }

  setUpEffects() {
    this.addEffect(new ForcePlayerExtraTurnEffect(2));
    this.addEffect(new EndTurnWithoutDrawingEffect());
  }
}
