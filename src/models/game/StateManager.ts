import type BaseCard from "../cards/_BaseCard";
import { type DeckManagerState } from "./DeckManager";
import { type Game } from "./Game";
import { type TurnManagerState } from "./TurnManager";

export class StateManager {
  private stateStack: GameState[] = [];

  captureState(game: Game): GameState {
    return {
      playerStates: new Map(
        game
          .getPlayerManager()
          .getPlayers()
          .map((player) => [
            player.getId(),
            {
              hand: [...player.getHand()],
            },
          ]),
      ),
      turnManagerState: game.getTurnManger().getState(),
      deckManagerState: game.getDeckManger().getState(),
    };
  }

  pushState(state: GameState) {
    this.stateStack.push(state);
  }

  popState(): GameState | undefined {
    return this.stateStack.pop();
  }

  saveState(game: Game) {
    const currentState = this.captureState(game);
    this.pushState(currentState);
  }

  restoreState(game: Game, state: GameState) {
    state.playerStates.forEach((playerState, playerId) => {
      const player = game.getPlayerManager().getPlayerById(playerId);
      if (player) {
        player.setHand(playerState.hand);
      }
    });
    game.getTurnManger().setState(state.turnManagerState);
    game.getDeckManger().setState(state.deckManagerState);
  }
}

interface GameState {
  playerStates: Map<string, PlayerState>;
  turnManagerState: TurnManagerState;
  deckManagerState: DeckManagerState;
}

interface PlayerState {
  hand: BaseCard[];
}
