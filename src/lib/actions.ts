import { GAME_ACTIONS, type PlayCardHadler } from "@/services/GameService";
import { socket } from "@/trpc/socket";

export function playCard(gameId: string, playerId: string, cardId: string) {
  const cardToPlay: PlayCardHadler = {
    gameId,
    playerId,
    cardId,
  };
  socket.emit(GAME_ACTIONS.PLAY_CARD, cardToPlay);
}
