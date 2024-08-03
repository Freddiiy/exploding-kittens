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
  protected _isCatCard: boolean;
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
    this._isCatCard = false;
  }

  getId(): string {
    return this.id;
  }

  setId(newId: string) {
    this.id = newId;
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

  isCatCard() {
    return this._isCatCard;
  }

  abstract play(game: Game, player: Player): void;

  toJSON() {
    const cardJSON: BaseCardJSON = {
      cardId: this.id,
      type: this.type,
      name: this.name,
      description: this.description,
      mechanics: this.mechanics,
      isCatCard: this.isCatCard(),
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
  isCatCard: boolean;
};
