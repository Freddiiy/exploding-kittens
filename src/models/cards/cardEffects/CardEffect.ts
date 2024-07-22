import { type Game } from "@/models/Game";
import { Player } from "@/models/Player";

export interface CardEffect {
  apply(game: Game, player: Player): void;

  log?(player: Player): string;
}
