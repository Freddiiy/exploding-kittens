import { CardType } from "./_CardType";
import Defuse from "./Defuse";
import ExplodingKitten from "./ExplodingKitten";

export class CardFactory {
  static createCard(type: CardType) {
    switch (type) {
      case CardType.EXPLODING_KITTEN:
        return new ExplodingKitten();
      case CardType.DEFUSE:
        return new Defuse();
    }
  }
}
