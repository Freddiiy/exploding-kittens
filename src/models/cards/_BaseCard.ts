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
  protected _comboType?: string;

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

  getComboType(): string | undefined {
    return this._comboType;
  }

  canComboWith(otherCard: BaseCard): boolean {
    // If either card is not a cat card, they can't combo
    if (this.isCatCard() || otherCard.isCatCard()) {
      return true;
    }

    // If either card doesn't have a combo type, they can't combo
    if (!this._comboType || !otherCard.getComboType()) {
      return false;
    }

    // Cards can combo if they have the same combo type
    return this._comboType === otherCard.getComboType();
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
      comboType: this._comboType,
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
  comboType?: string;
};
