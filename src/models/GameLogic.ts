import { type Expansion } from "./expansions/_ExpansionInterface";
import GameState from "./GameState";
import { Player, PlayerOptions } from "./Player";
import { Defuse } from "./cards/Defuse";
import type EventEmitter from "events";
import { generateRandomId } from "@/lib/generateRandomId";

interface GameSettings {
  public: boolean;
  name?: string;
}
export class GameLogic {
  createAt: Date;
  gameId: string;
  gameState: GameState;
  io: EventEmitter;
  gameSettings: GameSettings;

  constructor(
    io: EventEmitter,
    selectedExpansion: Expansion[],
    gameSettings: GameSettings,
  ) {
    this.gameId = generateRandomId(8);
    this.gameState = new GameState(selectedExpansion);
    this.io = io;

    const _gameSettings: GameSettings = {
      name: gameSettings.name ?? "A game of Exploding Kittens",
      public: gameSettings.public ?? true,
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

  addPlayer(opts: PlayerOptions) {
    const player = new Player(opts);
    this.gameState.players.push(player);
  }
}
