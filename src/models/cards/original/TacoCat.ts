import { CardType } from "../_CardType";
import CatCard from "../_CatCard";

export default class TacoCat extends CatCard {
  constructor() {
    super(CardType.TACO_CAT, "Taco Cat");
  }
}
