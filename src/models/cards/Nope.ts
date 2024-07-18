import BaseKittenCard from "./_BaseKittenCard";
import { AllCardsTypes } from "./_CardFactory";

export class Nope extends BaseKittenCard {
  constructor() {
    super(AllCardsTypes.NOPE);
  }
}
