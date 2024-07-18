import BaseKittenCard from "./_BaseKittenCard";
import { AllCardsTypes } from "./_CardFactory";

export class Defuse extends BaseKittenCard {
  constructor() {
    super(AllCardsTypes.DEFUSE);
  }
}
