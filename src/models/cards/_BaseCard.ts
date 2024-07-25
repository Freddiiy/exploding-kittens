import { generateRandomId } from "@/lib/generateRandomId";
import { type Game } from "../game/Game";
import { type Player } from "../Player";
import { type CardType } from "./_CardType";

export default abstract class BaseCard {
  protected id: string;
  protected type: CardType;
  protected name: string;
  protected description: string;
  protected mechanics: string;
  constructor(
    type: CardType,
    name: string,
    description: string,
    mechanics: string,
  ) {
    this.id = generateRandomId(16);
    this.type = type;
    this.name = name;
    this.description = description;
    this.mechanics = mechanics;
  }

  getId(): string {
    return this.id;
  }

  getType(): CardType {
    return this.type;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  abstract play(game: Game, player: Player): void;

  toJSON() {
    const cardJSON: BaseCardJSON = {
      cardId: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      mechanics: this.mechanics,
    };
    return cardJSON;
  }
}

export type BaseCardJSON = {
  cardId: string;
  type: CardType;
  name: string;
  description: string;
  mechanics: string;
};
