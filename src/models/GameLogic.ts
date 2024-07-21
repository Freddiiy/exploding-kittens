import { type Expansion } from "./expansions/_ExpansionInterface";
import GameState from "./GameState";
import { Player, PlayerData } from "./Player";
import { generateRandomId } from "@/lib/generateRandomId";

export interface GameSettings {
  publicGame: boolean;
  name: string;
  expansions: Expansion[];
}
export class GameLogic {
  createAt: Date;
  gameId: string;
  gameState: GameState;
  gameSettings: GameSettings;

  constructor(gameSettings: GameSettings) {
    this.gameId = generateRandomId(8);
    this.gameState = new GameState(gameSettings.expansions);

    const _gameSettings: GameSettings = {
      name: gameSettings.name ?? "A game of Exploding Kittens",
      publicGame: gameSettings.publicGame ?? true,
      expansions: gameSettings.expansions,
    };

    this.gameSettings = _gameSettings;
    this.createAt = new Date();
  }

  start() {
    this.gameState.shuffle();
    this.gameState.dealCards();
    this.gameState.activePlayerIndex = Math.floor(
      Math.random() * this.gameState.players.length,
    );
  }

  addPlayer(opts: PlayerData) {
    const player = new Player(opts);
    this.gameState.players.push(player);
  }
}
