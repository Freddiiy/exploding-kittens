import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { type CardEffect } from "./CardEffect";

export class EndTurnWithoutDrawingEffect implements CardEffect {
  apply(game: Game, player: Player): void {
    game.getTurnManger().endTurn();
  }
  log(player: Player) {
    return `${player.getUsername()} requested to take a card`;
  }
}
