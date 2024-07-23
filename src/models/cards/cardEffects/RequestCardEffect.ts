import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { type CardEffect } from "./CardEffect";

export class RequestCardEffect implements CardEffect {
  apply(game: Game, player: Player): void {
    throw new Error("Method not implemented.");
  }
  log(player: Player) {
    return `${player.getUsername()} requested to take a card`;
  }
}
