import { Defuse } from "../cards/Defuse";
import { ExplodingKitten } from "../cards/ExplodingKitten";
import { type Expansion } from "./_ExpansionInterface";
import { AllCardsTypes, KittenCardEnum } from "../cards/_CardFactory";

export const baseExpansion: Expansion = [
  { cardType: AllCardsTypes.EXPLODING_KITTEN, amount: 4 },
  { cardType: AllCardsTypes.DEFUSE, amount: 6 },
  //{ card: Skip, amount: 4 },
  //{ card: Attack, amount: 4 },
  //{ card: Favor, amount: 4 },
  //{ card: SeeTheFuture, amount: 4 },
  //{ card: Shuffle, amount: 4 },
  //{ card: Nope, amount: 4 },
];
