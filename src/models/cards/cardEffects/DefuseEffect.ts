import { type Game } from "@/models/game/Game";
import { Player } from "@/models/Player";
import { CardEffect } from "./CardEffect";

export default class DefuseEffect implements CardEffect {
  apply(game: Game, player: Player): void {
    throw new Error("Method not implemented.");
  }
  log?(player: Player): string {
    throw new Error("Method not implemented.");
  }
}
