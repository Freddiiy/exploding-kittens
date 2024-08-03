import { type Expansion } from "./_ExpansionInterface";
import { CardType } from "../cards/_CardType";

const baseExpansionCards = [
  { cardType: CardType.ATTACK, amount: 4 },
  { cardType: CardType.BEARD_CAT, amount: 4 },
  { cardType: CardType.CATTERMELON, amount: 4 },
  { cardType: CardType.HAIRY_POTATO_CAT, amount: 4 },
  { cardType: CardType.RAINBOW_RALPHING_CAT, amount: 4 },
  { cardType: CardType.TACO_CAT, amount: 4 },
  { cardType: CardType.FAVOR, amount: 4 },
  { cardType: CardType.NOPE, amount: 5 },
  { cardType: CardType.SEE_THE_FUTURE, amount: 5 },
  { cardType: CardType.SHUFFLE, amount: 4 },
  { cardType: CardType.SKIP, amount: 4 },
];

export const baseExpansion: Expansion = {
  expansionType: "Original",
  deck: baseExpansionCards,
};
