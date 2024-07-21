"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";

export const socket = io();

interface SocketContextProps {
  isConnected: boolean;
  transport: string;
}
const SocketContext = createContext<SocketContextProps | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}
export function SocketProvider({ children }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, transport }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const socketCtx = useContext(SocketContext);
  if (!socketCtx) {
    throw new Error("useSocket needs to be used inside SocketContext");
  }

  return socketCtx;
}
