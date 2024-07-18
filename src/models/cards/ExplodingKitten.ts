import BaseKittenCard from "./_BaseKittenCard";
import { AllCardsTypes } from "./_CardFactory";

export class ExplodingKitten extends BaseKittenCard {
  constructor() {
    super(AllCardsTypes.EXPLODING_KITTEN);
  }
}
