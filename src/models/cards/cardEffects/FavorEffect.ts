import { type Game } from "@/models/game/Game";
import { type CardEffect } from "./CardEffect";
import { type Player } from "@/models/Player";

export class FavorEffect implements CardEffect {
  async apply(game: Game, player: Player) {
    const requestManager = game.getRequestManager();

    const targetPlayer = await requestManager.requestChoosePlayer(player);

    if (!targetPlayer) {
      throw new Error("Could not find targeted player");
    }

    game
      .getActionmanager()
      .addNopeTimerCallback(
        async () =>
          await requestManager.requestGiveCardToPlayer(targetPlayer, player),
      );
  }

  getDescription(): string {
    return "Force any other player to give you 1 card from their hand. They choose which card to give you.";
  }
}
