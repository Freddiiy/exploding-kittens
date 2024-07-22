import { z } from "zod";
import type BaseCard from "./cards/_BaseCard";

export const playerOtionsSchema = z.object({
  userId: z.string().min(16).max(16),
  username: z.string().min(3),
  avatar: z.string(),
});
export interface PlayerData {
  userId: string;
  username: string;
  avatar: string;
}

export class Player {
  userId: string;
  username: string;
  avatar: string;
  handOfCards: BaseCard[] = [];

  constructor(playerOptions: PlayerData) {
    this.userId = playerOptions.userId;
    this.username = playerOptions.username;
    this.avatar = playerOptions.avatar;
  }
}
