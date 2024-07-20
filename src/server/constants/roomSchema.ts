import { playerOtionsSchema } from "@/models/Player";
import { z } from "zod";
import { joinGameSchema } from "./joinGameSchema";

export const roomSchema = joinGameSchema.merge(playerOtionsSchema);
