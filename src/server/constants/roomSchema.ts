import { z } from "zod";

export const roomSchema = z.object({
  gameId: z.string(),
});
