import { CardType } from "./_CardType";
import Defuse from "./Defuse";
import ExplodingKitten from "./ExplodingKitten";
import Attack from "./original/Attack";
import Favor from "./original/Favor";
import Nope from "./original/Nope";
import Shuffle from "./original/Shuffle";
import Skip from "./original/Skip";
import TacoCat from "./original/TacoCat";

export class CardFactory {
  static createCard(type: CardType) {
    switch (type) {
      case CardType.EXPLODING_KITTEN:
        return new ExplodingKitten();
      case CardType.DEFUSE:
        return new Defuse();
      case CardType.ATTACK:
        return new Attack();
      case CardType.NOPE:
        return new Nope();
      case CardType.SHUFFLE:
        return new Shuffle();
      case CardType.SKIP:
        return new Skip();
      case CardType.FAVOR:
        return new Favor();
      case CardType.TACO_CAT:
        return new TacoCat();
      default:
        throw new Error("Card not recognized");
    }
  }
}
