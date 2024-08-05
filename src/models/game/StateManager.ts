import type BaseCard from "../cards/_BaseCard";
import { type DeckManagerState } from "./DeckManager";
import { type Game } from "./Game";
import { type TurnManagerState } from "./TurnManager";

export class StateManager {
  private stateStack: GameState[] = [];

  captureState(game: Game) {
    const state: GameState = {
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

    return state;
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

  restoreState(game: Game) {
    if (this.stateStack.length === 0) {
      console.warn("Attempted to restore state with empty stack");
      return;
    }

    const state = this.stateStack.pop();

    if (state) {
      if (game.getDeckManger().getDiscardPile().at(0)?.isCatCard()) {
        state.playerStates.forEach((playerState, playerId) => {
          const player = game.getPlayerManager().getPlayerById(playerId);
          if (player) {
            player.setHand(playerState.hand);
          }
        });
      }
      game.getDeckManger().setState(state.deckManagerState);
      game.getTurnManger().setState(state.turnManagerState);
    }
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
