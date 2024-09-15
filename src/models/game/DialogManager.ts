import { type Game } from "./Game";
import {
  ClientRequestMap,
  GAME_REQUESTS,
  type GAME_REQUEST,
} from "./RequestManager";

export interface DialogState {
  requestType: keyof ClientRequestMap;
  data?: any;
}

export class DialogManager {
  private game: Game;
  private openDialogs: Map<string, Map<string, DialogState>> = new Map(); // gameId -> (playerId -> DialogState)

  constructor(game: Game) {
    this.game = game;
  }

  openDialog(
    playerId: string,
    requestType: keyof ClientRequestMap,
    data?: any,
  ) {
    if (!this.openDialogs.has(this.game.getId())) {
      this.openDialogs.set(this.game.getId(), new Map());
    }
    const dataToClient: DialogState = {
      requestType,
      data,
    };
    this.openDialogs.get(this.game.getId())!.set(playerId, dataToClient);
  }

  closeDialog(playerId: string) {
    this.openDialogs.get(this.game.getId())?.delete(playerId);
  }

  getDialogState(playerId: string): DialogState | undefined {
    return this.openDialogs.get(this.game.getId())?.get(playerId);
  }

  isDialogOpen(playerId: string): boolean {
    return this.openDialogs.get(this.game.getId())?.has(playerId) ?? false;
  }

  getOpenDialogPlayers(): string[] {
    return Array.from(this.openDialogs.get(this.game.getId())?.keys() ?? []);
  }
}
