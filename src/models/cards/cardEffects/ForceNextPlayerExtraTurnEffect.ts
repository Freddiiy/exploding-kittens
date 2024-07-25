import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { CardEffect } from "./CardEffect";

export class ForceNextPlayerExtraTurnEffect implements CardEffect {
  private turns: number;

  constructor(turns: number = 2) {
    this.turns = turns;
  }
  apply(game: Game, player: Player): void {
    game.getTurnManger().addTurnsToNextPlayer(2);
  }
}
