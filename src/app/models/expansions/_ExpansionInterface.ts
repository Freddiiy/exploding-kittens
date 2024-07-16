import BaseKittenCard from "../cards/_BaseKittenCard";

export interface ExpansionInterfaceCard {
  card: new () => BaseKittenCard;
  amount: number;
}

export type Expansion = ExpansionInterfaceCard[];
