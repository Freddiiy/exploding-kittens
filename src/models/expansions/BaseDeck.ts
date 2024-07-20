import { type Expansion } from "./_ExpansionInterface";
import { AllCardsTypes } from "../cards/_CardFactory";

const baseExpansionCards = [
  { cardType: AllCardsTypes.EXPLODING_KITTEN, amount: 4 },
  { cardType: AllCardsTypes.DEFUSE, amount: 6 },
  { cardType: AllCardsTypes.SKIP, amount: 4 },
  { cardType: AllCardsTypes.ATTACK, amount: 4 },
  { cardType: AllCardsTypes.FAVOR, amount: 4 },
  { cardType: AllCardsTypes.SEE_THE_FUTURE_3X, amount: 4 },
  { cardType: AllCardsTypes.SHUFFLE, amount: 4 },
  { cardType: AllCardsTypes.NOPE, amount: 4 },
];

export const baseExpansion: Expansion = {
  expansionType: "Original",
  deck: baseExpansionCards,
};
