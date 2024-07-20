import { createContext } from "react";
import { type Socket } from "socket.io";

export function SocketHandler(socket: Socket) {
  console.log("Client connected");
}
