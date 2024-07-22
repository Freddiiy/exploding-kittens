import { CardType } from "./_CardType";
import CatCard from "./_CatCard";

export default class TacoCatCard extends CatCard {
  constructor() {
    super(CardType.TACO_CAT, "Taco Cat");
  }
}
