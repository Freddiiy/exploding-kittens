"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { generateRandomId } from "@/lib/generateRandomId";
import { PlayerData } from "@/models/Player";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
} from "react";

interface IUserContext {
  user: PlayerData;
  setUser: Dispatch<SetStateAction<PlayerData>>;
}

const UserContext = createContext<IUserContext | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [localStorageUser, setLocalStoragePlayer] = useLocalStorage<PlayerData>(
    "player",
    {
      userId: generateRandomId(16),
      username: "",
      avatar: "",
    },
  );

  return (
    <UserContext.Provider
      value={{ user: localStorageUser, setUser: setLocalStoragePlayer }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const userCtx = useContext(UserContext);

  if (!userCtx) {
    throw new Error("useUser can only be used inside UserProvider");
  }

  return userCtx;
}
