import { type Expansion } from "./expansions/_ExpansionInterface";
import GameState from "./GameState";
import { Player } from "./Player";
import { Defuse } from "./cards/Defuse";
import { type Server } from "socket.io";

const MAX_AMOUNT_OF_CARDS = 7;
const gameIdSet = new Set<string>();
export class GameLogic {
  gameId: string;
  gameState: GameState;
  io: Server;

  constructor(io: Server, selectedExpansion: Expansion[]) {
    this.gameId = generateGameId(6);
    this.gameState = new GameState(selectedExpansion);
    this.io = io;
  }

  start() {
    this.dealCards();
    this.gameState.activePlayerIndex = Math.floor(
      Math.random() * this.gameState.players.length,
    );
  }

  dealCards() {
    this.gameState.players.forEach((p) => {
      p.handOfCards.push(new Defuse());
      Array.from(Array(MAX_AMOUNT_OF_CARDS).keys()).forEach(() => {
        const drawnCard = this.gameState.deck.pop();
        if (drawnCard) {
          p.handOfCards.push(drawnCard);
        }
      });
    });
  }
  addPlayer(name: string, character: string) {
    const player = new Player(name, character);
    this.gameState.players.push(player);
  }
}

function generateGameId(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));

    if (gameIdSet.has(result)) {
      generateGameId(length);
    }

    counter++;
    gameIdSet.add(result);
  }
  return result;
}
