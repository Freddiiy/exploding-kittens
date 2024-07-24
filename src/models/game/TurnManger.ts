import { type Player } from "../Player";

export default class TurnManager {
  private currentPlayerId: string | null = null;
  // clockwise and counter clickwise indicators.
  private turnDirection: 1 | -1 = 1;
  private playerOrder: string[] = [];
  private turnsOnNextPlayer: number = 0;

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

  nextTurn(players: Player[]) {
    if (!this.currentPlayerId) return; // Game hasn't started

    const currentIndex = players.findIndex(
      (p) => p.getId() === this.currentPlayerId,
    );
    let nextIndex =
      (currentIndex + this.turnDirection + players.length) % players.length;

    const nextPlayerId = players.at(nextIndex)?.getId();

    if (nextPlayerId) {
      this.currentPlayerId = nextPlayerId;
    }
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

  addTurnsToNextPlayer(turns: number) {
    this.turnsOnNextPlayer += turns;
  }

  endTurn() {
    if (this.currentPlayerId === null) return;

    const currentIndex = this.playerOrder;
  }
}
