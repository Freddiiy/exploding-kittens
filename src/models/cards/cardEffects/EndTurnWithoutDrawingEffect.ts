import { type Game } from "@/models/game/Game";
import { type Player } from "@/models/Player";
import { type CardEffect } from "./CardEffect";

export class EndTurnWithoutDrawingEffect implements CardEffect {
  apply(game: Game): void {
    game.getTurnManger().endTurn(game.getPlayerManager().getPlayers());
  }
  log(player: Player) {
    return `${player.getUsername()} requested to take a card`;
  }
}
