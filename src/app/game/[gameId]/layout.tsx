import { type Metadata } from "next";
import { GameProvider, GiveCardProvider } from "@/components/game-provider";

export const metadata: Metadata = {
  title: "Exploding Kittens",
  description: "The game just online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function GameLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <GameProvider>
      <GiveCardProvider>{children}</GiveCardProvider>
    </GameProvider>
  );
}
