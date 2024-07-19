import { type Expansion } from "./expansions/_ExpansionInterface";
import GameState from "./GameState";
import { Player } from "./Player";
import { Defuse } from "./cards/Defuse";
import type EventEmitter from "events";
import { generateRandomId } from "@/lib/generateRandomId";

interface GameSettings {
  private: boolean;
  name: string;
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
    gameSettings: GameSettings = {
      private: false,
      name: "An Exploding Kittens Game",
    },
  ) {
    this.gameId = generateRandomId(8);
    this.gameState = new GameState(selectedExpansion);
    this.io = io;
    this.gameSettings = gameSettings;
    this.createAt = new Date();
  }

  start() {
    this.gameState.shuffle();
    this.gameState.dealCards();
    this.gameState.activePlayerIndex = Math.floor(
      Math.random() * this.gameState.players.length,
    );
  }

  addPlayer(name: string, character: string) {
    const player = new Player(name, character);
    this.gameState.players.push(player);
  }
}
