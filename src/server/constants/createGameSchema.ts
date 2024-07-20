import { ExpansionSchema } from "@/models/expansions/_ExpansionInterface";
import { playerOtionsSchema } from "@/models/Player";
import { z } from "zod";

export const createGameSchema = z.object({
  player: playerOtionsSchema,
  expansions: z.array(ExpansionSchema),
  settings: z.object({
    public: z.boolean(),
    name: z.string().optional(),
  }),
});
export type CreateGameType = z.infer<typeof createGameSchema>;
