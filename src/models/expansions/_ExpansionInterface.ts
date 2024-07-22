import { z } from "zod";
import { OriginalCardsEnum } from "../cards/_CardType";

// Define the Zod schema for ExpansionInterfaceCard
export const expansionInterfaceCardSchema = z.object({
  cardType: z.nativeEnum(OriginalCardsEnum),
  amount: z.number().int().nonnegative(),
});

export const ExpansionSchema = z.object({
  expansionType: z.string(),
  deck: z.array(expansionInterfaceCardSchema),
});

export type ExpansionInterfaceCard = z.infer<
  typeof expansionInterfaceCardSchema
>;
export type Expansion = z.infer<typeof ExpansionSchema>;
