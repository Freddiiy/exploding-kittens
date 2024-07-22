import { type Game } from "../Game";
import { type Player } from "../Player";
import BaseCard from "./_BaseCard";
import { CardType } from "./_CardType";

export default class ExplodingKitten extends BaseCard {
  constructor() {
    super(
      CardType.EXPLODING_KITTEN,
      "Exploding Kitten",
      "You explode unless you have a Defuse card",
      "You must show this card immediately. Unless you have a Defuse Card, you're dead. Discard all of your cards, including the Exploding Kitten.",
    );
  }

  play(game: Game, player: Player): void {
    throw new Error("Exploding Kitten cannot be played from hand!");
  }
}
