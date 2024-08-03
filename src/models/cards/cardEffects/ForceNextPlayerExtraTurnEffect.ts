import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { type CardEffect } from "./CardEffect";
import { AttackType } from "@/models/game/TurnManager";

export class ForcePlayerExtraTurnEffect implements CardEffect {
  private turns: number;
  private targetPlayerId: string | null;
  constructor(turns: number = 2, targetPlayerId: string | null = null) {
    this.turns = turns;
    this.targetPlayerId = targetPlayerId;
  }
  apply(game: Game, player: Player) {
    game
      .getTurnManger()
      .addAttack(this.turns, AttackType.NORMAL, this.targetPlayerId);
  }
}
