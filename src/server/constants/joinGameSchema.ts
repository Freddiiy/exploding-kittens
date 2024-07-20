import { playerOtionsSchema } from "@/models/Player";
import { z } from "zod";

export const joinGameSchema = z.object({
  gameId: z.string(),
  player: playerOtionsSchema,
});
