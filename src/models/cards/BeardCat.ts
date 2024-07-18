import { BaseCatCard } from "./_BaseCatCard";
import { CatCardsEnum } from "./_CardFactory";

export class BeardCat extends BaseCatCard {
  constructor() {
    const catType = CatCardsEnum.BEARD_CAT;
    super(catType);
  }
}
