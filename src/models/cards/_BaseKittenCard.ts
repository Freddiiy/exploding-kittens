import type GameState from "../GameState";
import { type Player } from "../Player";

export default abstract class BaseKittenCard {
  type: string;
  name: string;
  constructor(type: string, name: string = type) {
    this.type = type;
    this.name = name;
  }

  onDraw?(game: GameState, player: Player): void;
  onPlay?(game: GameState, player: Player): void;
}
