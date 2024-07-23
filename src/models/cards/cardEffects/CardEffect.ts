import { type Game } from "@/models/game/Game";
import { Player } from "@/models/Player";

export interface CardEffect {
  apply(game: Game, player: Player): void;

  log?(player: Player): string;
}
