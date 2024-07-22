import { type Game } from "../Game";
import { type Player } from "../Player";
import BaseCard from "./_BaseCard";
import { type CardType } from "./_CardType";

export default abstract class CatCard extends BaseCard {
  constructor(type: CardType, name: string) {
    const description =
      "This is a cat card and is powerless on its own. Play two of the same cats as a pair to steal a random card from another player.";
    const mechanics =
      "These cards are powerless on their own, but can be used in Special Combos.";
    super(type, name, description, mechanics);
  }
  play(game: Game, player: Player): void {}
}
