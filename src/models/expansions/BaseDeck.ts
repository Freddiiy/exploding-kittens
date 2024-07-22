import { type Expansion } from "./_ExpansionInterface";
import { CardType } from "../cards/_CardType";

const baseExpansionCards = [
  { cardType: CardType.EXPLODING_KITTEN, amount: 4 },
  { cardType: CardType.DEFUSE, amount: 6 },
  { cardType: CardType.SKIP, amount: 4 },
  { cardType: CardType.ATTACK, amount: 4 },
  { cardType: CardType.FAVOR, amount: 4 },
  { cardType: CardType.SEE_THE_FUTURE_3X, amount: 4 },
  { cardType: CardType.SHUFFLE, amount: 4 },
  { cardType: CardType.NOPE, amount: 4 },
];

export const baseExpansion: Expansion = {
  expansionType: "Original",
  deck: baseExpansionCards,
};
