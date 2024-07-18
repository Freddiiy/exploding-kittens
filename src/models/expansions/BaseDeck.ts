import { Defuse } from "../cards/Defuse";
import { ExplodingKitten } from "../cards/ExplodingKitten";
import { type Expansion } from "./_ExpansionInterface";

export const baseExpansion: Expansion = [
  { card: new ExplodingKitten(), amount: 4 },
  { card: new Defuse(), amount: 6 },
  //{ card: Skip, amount: 4 },
  //{ card: Attack, amount: 4 },
  //{ card: Favor, amount: 4 },
  //{ card: SeeTheFuture, amount: 4 },
  //{ card: Shuffle, amount: 4 },
  //{ card: Nope, amount: 4 },
];
