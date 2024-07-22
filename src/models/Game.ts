import type BaseCard from "./cards/_BaseCard";
import Defuse from "./cards/Defuse";
import { type Expansion } from "./expansions/_ExpansionInterface";
import { baseExpansion } from "./expansions/BaseDeck";
import { Player, type PlayerData } from "./Player";
import { generateRandomId } from "@/lib/generateRandomId";

const MAX_AMOUNT_OF_CARDS = 7;
export interface GameSettings {
  publicGame: boolean;
  name: string;
  expansions: Expansion[];
}
export class Game {
  createAt: Date;
  players: Player[];
  currentTurn: number;
  id: string;
  deck: BaseCard[] = [];
  discardPile: BaseCard[] = [];
  gameSettings: GameSettings;

  constructor(gameSettings: GameSettings) {
    this.players = [];
    this.currentTurn = 0;
    this.id = generateRandomId(8);

    const _gameSettings: GameSettings = {
      name: gameSettings.name ?? "A game of Exploding Kittens",
      publicGame: gameSettings.publicGame ?? true,
      expansions: gameSettings.expansions,
    };

    this.gameSettings = _gameSettings;
    this.createAt = new Date();
  }

  start() {
    this.shuffle();
    this.dealCards();
    this.currentTurn = Math.floor(Math.random() * this.players.length);
  }

  addPlayer(opts: PlayerData) {
    const player = new Player(opts);
    this.players.push(player);
  }

  initialize(selectedExpansions: Expansion[]) {
    const expansions = [baseExpansion, ...selectedExpansions];

    expansions.forEach((exps) => {
      exps.deck.forEach(({ cardType, amount }) => {
        Array.from(Array(amount).keys()).forEach(() => {
          //TODO: ADD CARD FACTORY
          this.deck.push();
        });
      });
    });

    this.shuffle();
  }

  //Fisher-Yates shuffle algo
  shuffle() {
    this.deck.forEach((_, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      if (this.deck[i] !== undefined && this.deck[j] !== undefined) {
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    });
  }

  dealCards() {
    this.players.forEach((p) => {
      p.handOfCards.push(new Defuse());
      Array.from(Array(MAX_AMOUNT_OF_CARDS).keys()).forEach(() => {
        const drawnCard = this.deck.pop();
        if (drawnCard) {
          p.handOfCards.push(drawnCard);
        }
      });
    });
  }

  sanitize(userId: string) {
    const game = this;
    const santasizedGame = {
      gameState: this.players.map((player) => {
        if (player.userId === userId) {
          return {
            avatar: player.avatar,
            username: player.username,
            handSize: player.handOfCards.length,
            handOfCards: player.handOfCards,
          };
        }
        return {
          avatar: player.avatar,
          username: player.username,
          handSize: player.handOfCards.length,
          handOfCards: [],
        };
      }),
    };

    return santasizedGame;
  }
}
