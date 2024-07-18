import BaseKittenCard from "./_BaseKittenCard";
import { AllCardsTypes } from "./_CardFactory";

export class Skip extends BaseKittenCard {
  constructor() {
    super(AllCardsTypes.SKIP);
  }
}
