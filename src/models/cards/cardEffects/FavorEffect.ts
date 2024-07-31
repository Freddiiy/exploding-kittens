import { type Game } from "@/models/game/Game";
import { type CardEffect } from "./CardEffect";
import { type Player } from "@/models/Player";

export class FavorEffect implements CardEffect {
  async apply(game: Game, player: Player) {
    const playerManager = game.getPlayerManager();

    const targetPlayer = await playerManager.selectPlayer(player);

    if (!targetPlayer) {
      throw new Error("Could not find targeted player");
    }

    const selectedCard = await playerManager.selectCardFromPlayer(
      targetPlayer,
      player,
    );

    if (!selectedCard) {
      throw new Error("No card selected");
    }

    playerManager.transferCard(targetPlayer, player, selectedCard);
  }

  getDescription(): string {
    return "Force any other player to give you 1 card from their hand. They choose which card to give you.";
  }
}
