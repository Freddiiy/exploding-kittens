import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { CardEffect } from "./CardEffect";

export class ShuffleEffect implements CardEffect {
  apply(game: Game, player: Player): void {
    game.getDeckManger().shuffle();
  }
}