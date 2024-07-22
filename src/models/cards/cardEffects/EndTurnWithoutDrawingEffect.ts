import { type Game } from "@/models/Game";
import { type Player } from "@/models/Player";
import { type CardEffect } from "./CardEffect";

export class EndTurnWithoutDrawingEffect implements CardEffect {
  apply(game: Game, player: Player): void {
    throw new Error("Method not implemented.");
  }
  log(player: Player) {
    return `${player.username} requested to take a card`;
  }
}
