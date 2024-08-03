import { CardType } from "./_CardType";
import Defuse from "./Defuse";
import ExplodingKitten from "./ExplodingKitten";
import Attack from "./original/Attack";
import BeardCat from "./original/BeardCat";
import Cattermelon from "./original/Cattermelon";
import Favor from "./original/Favor";
import HairyPotatoCat from "./original/HairyPotatoCat";
import Nope from "./original/Nope";
import RainbowRalphingCat from "./original/RainbowRalphingCat";
import SeeTheFuture from "./original/SeeTheFuture";
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
      case CardType.FAVOR:
        return new Favor();
      case CardType.NOPE:
        return new Nope();
      case CardType.SEE_THE_FUTURE:
        return new SeeTheFuture();
      case CardType.SHUFFLE:
        return new Shuffle();
      case CardType.SKIP:
        return new Skip();

      case CardType.BEARD_CAT:
        return new BeardCat();
      case CardType.CATTERMELON:
        return new Cattermelon();
      case CardType.HAIRY_POTATO_CAT:
        return new HairyPotatoCat();
      case CardType.RAINBOW_RALPHING_CAT:
        return new RainbowRalphingCat();
      case CardType.TACO_CAT:
        return new TacoCat();
      default:
        throw new Error("Card not recognized");
    }
  }
}
