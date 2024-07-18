import { z } from "zod";
import { OriginalCardsEnum } from "../cards/_CardFactory";

// Define the Zod schema for ExpansionInterfaceCard
export const ExpansionInterfaceCardSchema = z.object({
  cardType: z.nativeEnum(OriginalCardsEnum),
  amount: z.number().int().nonnegative(),
});

export const ExpansionSchema = z.array(ExpansionInterfaceCardSchema);

export type ExpansionInterfaceCard = z.infer<
  typeof ExpansionInterfaceCardSchema
>;
export type Expansion = z.infer<typeof ExpansionSchema>;
