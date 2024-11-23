import { type Player } from "../Player";
import { type Game } from "./Game";

export default class TurnManager {
  private currentPlayerId: string | null = null;
  // clockwise and counter clickwise indicators.
  private turnDirection: 1 | -1 = 1;
  private playerOrder: string[];
  private attackStack: AttackState[];
  private hasDrawnThisTurn: boolean = false;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.attackStack = [];
    this.playerOrder = [];
  }

  initializePlayerOrder(players: Player[]) {
    this.playerOrder = players.map((player) => player.getId());
    this.shufflePlayerOrder();
  }

  private shufflePlayerOrder() {
    for (let i = this.playerOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      //Null pointer assertion. Is it safe? Dunno.
      [this.playerOrder[i], this.playerOrder[j]] = [
        this.playerOrder[j]!,
        this.playerOrder[i]!,
      ];
    }
  }

  setFirstPlayer(playerId: string) {
    this.currentPlayerId = playerId;
  }

  endTurn() {
    if (!this.currentPlayerId) return; // Game hasn't started

    if (this.attackStack.length === 0) {
      this.moveToNextPlayer();
    } else {
      this.currentPlayerId = this.attackStack[0]?.targetPlayerId ?? null;
    }

    this.hasDrawnThisTurn = false;
  }

  handleCardDrawn() {
    if (this.attackStack.length > 0) {
      const currentAttack = this.attackStack.at(0);
      currentAttack?.decrementTurns();

      if (currentAttack?.isComplete()) {
        this.attackStack.shift();
      }
    }

    this.hasDrawnThisTurn = false;
  }

  private moveToNextPlayer() {
    const currentIndex = this.playerOrder.indexOf(this.currentPlayerId!);
    const nextIndex = (currentIndex + 1) % this.playerOrder.length;
    const newCurrentPlayerId = this.playerOrder.at(nextIndex) ?? null;

    const newCurrentPlayer =
      this.game.getPlayerManager().getPlayerById(newCurrentPlayerId ?? "") ??
      null;

    if (newCurrentPlayer?.isEliminated()) {
      this.moveToNextPlayer();
    } else {
      this.currentPlayerId = newCurrentPlayerId;
    }
  }

  addAttack(
    turns: number,
    attackType: AttackType,
    targetPlayerId: string | null = null,
  ) {
    const actualTargetId = targetPlayerId ?? this.getNextPlayerId();

    if (
      this.attackStack.length > 0 &&
      this.attackStack.at(0)?.targetPlayerId === this.currentPlayerId
    ) {
      // If the current player is under attack and plays an attack card,
      // transfer the remaining turns to the new target
      const currentAttack = this.attackStack.shift()!;
      turns += currentAttack.remainingTurns;
    }

    this.attackStack.unshift(
      new AttackState(turns, actualTargetId, attackType),
    );
  }
  isUnderAttack(playerId: string): boolean {
    return (
      this.attackStack.length > 0 &&
      this.attackStack.at(0)?.targetPlayerId === playerId
    );
  }

  startNewTurn() {
    this.hasDrawnThisTurn = false;
  }

  getRemainingTurns() {
    return this.attackStack.length > 0
      ? (this.attackStack.at(0)?.remainingTurns ?? 0)
      : 0;
  }

  canDrawCard() {
    return (
      !this.hasDrawnThisTurn &&
      (this.attackStack.length === 0 ||
        this.attackStack.at(0)?.remainingTurns! > 0)
    );
  }

  markCardDrawn() {
    this.hasDrawnThisTurn = true;
  }

  decrementAttackTurns() {
    if (this.attackStack.length > 0) {
      this.attackStack.at(0)?.decrementTurns();
      if (this.attackStack.at(0)?.isComplete()) {
        this.attackStack.shift();
      }
    }
  }

  getNextPlayerId(): string {
    const currentIndex = this.playerOrder.indexOf(this.currentPlayerId!);
    const nextIndex =
      (currentIndex + this.turnDirection + this.playerOrder.length) %
      this.playerOrder.length;
    return this.playerOrder.at(nextIndex)!;
  }

  getCurrentPlayerId(): string | null {
    return this.currentPlayerId;
  }

  setCurrentPlayerId(playerId: string) {
    this.currentPlayerId = playerId;
  }

  reverseTurnOrder() {
    // x * minus = plus quick maths. Flipts turn direction
    this.turnDirection *= -1;
  }

  getState(): TurnManagerState {
    return {
      currentPlayerId: this.currentPlayerId,
      playerOrder: [...this.playerOrder],
      turnDirection: this.turnDirection,
      attackStack: this.attackStack.map((attack) => ({ ...attack })),
    };
  }

  setState(state: TurnManagerState) {
    this.currentPlayerId = state.currentPlayerId;
    this.playerOrder = [...state.playerOrder];
    this.turnDirection = state.turnDirection;
    this.attackStack = state.attackStack.map(
      (attack) =>
        new AttackState(
          attack.remainingTurns,
          attack.targetPlayerId,
          attack.attackType,
        ),
    );
  }
}

export interface TurnManagerState {
  currentPlayerId: string | null;
  playerOrder: string[];
  turnDirection: 1 | -1;
  attackStack: {
    remainingTurns: number;
    targetPlayerId: string;
    attackType: AttackType;
  }[];
}

export type AttackType = (typeof AttackType)[keyof typeof AttackType];
export const AttackType = {
  NORMAL: "NORMAL",
  TARGETED: "TARGETED",
  PERSONAL: "PERSONAL",
} as const;

class AttackState {
  public remainingTurns: number;
  public targetPlayerId: string;
  public attackType: AttackType;
  constructor(
    remainingTurns: number,
    targetPlayerId: string,
    attackType: AttackType,
  ) {
    this.remainingTurns = remainingTurns;
    this.targetPlayerId = targetPlayerId;
    this.attackType = attackType;
  }

  addTurns(turns: number) {
    this.remainingTurns += turns;
  }

  decrementTurns() {
    this.remainingTurns--;
  }

  isComplete() {
    return this.remainingTurns === 0;
  }
}
