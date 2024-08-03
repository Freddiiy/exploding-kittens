import { CardType } from "../_CardType";
import CatCard from "../_CatCard";

export default class BeardCat extends CatCard {
  constructor() {
    super(CardType.BEARD_CAT, "Beard cat");
  }
}
