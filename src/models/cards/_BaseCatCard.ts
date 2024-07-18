import BaseKittenCard from "./_BaseKittenCard";
import { AllCardsTypes, CatCardEnum } from "./_CardFactory";

export abstract class BaseCatCard extends BaseKittenCard {
  catType: string;
  constructor(catType: CatCardEnum) {
    super(AllCardsTypes.CAT_CARD);
    this.catType = catType;
  }
}
