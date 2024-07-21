import {
  type Expansion,
  ExpansionSchema,
} from "@/models/expansions/_ExpansionInterface";
import { z } from "zod";
import { playerOtionsSchema, type PlayerData } from "@/models/Player";

export const createGameSchema = z.object({
  player: playerOtionsSchema,
  settings: z.object({
    publicGame: z.boolean(),
    name: z.string(),
    expansions: z.array(ExpansionSchema),
  }),
});
export interface CreateGameType {
  player: PlayerData;
  settings: {
    publicGame: boolean;
    name: string;
    expansions: Expansion[];
  };
}
