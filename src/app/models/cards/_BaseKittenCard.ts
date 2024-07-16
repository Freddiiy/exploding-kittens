import GameState from "../GameState";
import { Player } from "../Player";

export default abstract class BaseKittenCard {
  type: string;
  constructor(type: string) {
    this.type = type;
  }

  onDraw?(game: GameState, player: Player): void;
  onPlay?(game: GameState, player: Player): void;
}
