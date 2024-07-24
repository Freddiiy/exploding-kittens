import { type Metadata } from "next";
import { SocketProvider } from "@/trpc/socket";
import { GameProvider } from "@/components/game-provider";

export const metadata: Metadata = {
  title: "Exploding Kittens",
  description: "The game just online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function GameLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
