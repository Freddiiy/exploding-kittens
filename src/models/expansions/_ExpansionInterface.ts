import { z } from "zod";
import BaseKittenCard from "../cards/_BaseKittenCard";

// Define the Zod schema for ExpansionInterfaceCard
export const ExpansionInterfaceCardSchema = z.object({
  card: z.custom<BaseKittenCard>((arg) => arg instanceof BaseKittenCard),
  amount: z.number().int().nonnegative(),
});

export const ExpansionSchema = z.array(ExpansionInterfaceCardSchema);

export type ExpansionInterfaceCard = z.infer<
  typeof ExpansionInterfaceCardSchema
>;
export type Expansion = z.infer<typeof ExpansionSchema>;
