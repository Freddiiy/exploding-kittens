import { type Player } from "../Player";

export default class PlayerManager {
  private players: Player[];
  private maxPlayers;
  private disconnectedPlayers: Map<string, Player> = new Map();

  constructor(maxPlayers: number = 5) {
    this.players = [];
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: Player): boolean {
    if (this.players.length >= this.maxPlayers) {
      return false; // Game is full
    }
    this.players.push(player);
    return true;
  }

  getPlayers() {
    // returns a copy to prevent modifications to array
    return [...this.players];
  }

  getPlayerById(playerId: string) {
    return this.players.find((player) => player.getId() === playerId);
  }

  getMaxPlayers() {
    return this.maxPlayers;
  }

  removePlayer(playerId: string) {
    const index = this.players.findIndex((p) => p.getId() === playerId);
    if (index !== -1) {
      this.players.splice(index, 1);
    }

    return this.getPlayers();
  }

  disconnectPlayer(playerId: string) {
    const player = this.players.find((p) => p.getId() === playerId);
    if (player) {
      this.players = this.players.filter((p) => p.getId() !== playerId);
      this.disconnectedPlayers.set(player.getId(), player);
    }
  }

  reconnectPlayer(playerId: string, newSocketId: string) {
    let player = this.disconnectedPlayers.get(playerId);
    if (player) {
      player.setSocketId(newSocketId);
      this.players.push(player);
      this.disconnectedPlayers.delete(playerId);
      return player;
    }

    player = this.players.find((p) => p.getId() === playerId);
    if (player) {
      player.setSocketId(newSocketId);
    } else {
      return null;
    }

    return player;
  }

  isPlayerDisconnected(playerId: string): boolean {
    return this.disconnectedPlayers.has(playerId);
  }
}
