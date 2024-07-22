import { type Game } from "../Game";
import { type Player } from "../Player";
import ActionCard from "./_ActionCard";
import { CardType } from "./_CardType";

export default class Defuse extends ActionCard {
  constructor() {
    const mechanics = `If you drew an Exploding Kitten, you can play this card instead of dying. Place your Defuse Card in the Discard Pile. \n \
    Then take the Exploding Kitten, and without reordering or viewing the other cards, secretly put it back in the Draw Pile anywhere you’d like. \n \
    Want to screw over the player right after you? Put the Kitten right on top of the deck. If you’d like, hold the deck under the table so that no one else can see where you put it. \n \
    Your turn is over after playing this card.`;

    super(
      CardType.DEFUSE,
      "Defuse",
      "Instead of exploding, secretly put your last drawn card back into the deck.",
      mechanics,
    );
  }

  protected action(game: Game, player: Player): void {
    throw new Error("Method not implemented.");
  }
}
