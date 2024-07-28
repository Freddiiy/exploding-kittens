import { BaseCardJSON } from "@/models/cards/_BaseCard";
import {
  type DrawCardHandler,
  GAME_ACTIONS,
  type StartGameHandler,
  type PlayCardHandler,
} from "@/services/GameService";
import { socket } from "@/trpc/socket";

export function playCard(gameId: string, playerId: string, cardId: string) {
  const cardToPlay: PlayCardHandler = {
    gameId,
    playerId,
    cardId,
  };
  socket.emit(GAME_ACTIONS.PLAY_CARD, cardToPlay);
}

export function drawCard(gameId: string, playerId: string) {
  const cardToPlay: DrawCardHandler = {
    gameId,
    playerId,
  };
  socket.emit(GAME_ACTIONS.DRAW_CARD, cardToPlay);
}

export function startGame(gameId: string, playerId: string) {
  const startGameObj: StartGameHandler = {
    gameId,
    playerId,
  };

  socket.emit(GAME_ACTIONS.START_GAME, startGameObj);
}
