import { type Server, type Socket } from "socket.io";
import { joinGameHandler } from "./handlers/joinGameHandler";
import { createGameHandler } from "./handlers/createGameHandler";
import { rejoinGameHandler } from "./handlers/rejoinGameHandler";

export function SocketHandler(io: Server, socket: Socket) {
  rejoinGameHandler(io, socket);
  createGameHandler(io, socket);
  joinGameHandler(io, socket);
}
