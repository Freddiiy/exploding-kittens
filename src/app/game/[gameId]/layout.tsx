import { type Metadata } from "next";
import { GameProvider } from "@/components/game-provider";

import { NopeTimerProvider } from "@/components/kittens/auto-nope";
import { GiveCardProvider } from "@/components/give-cards-dialog";
import { ViewDeckProvider } from "@/components/view-deck-dialog";

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
      <NopeTimerProvider>
        <GiveCardProvider>
          <ViewDeckProvider>{children}</ViewDeckProvider>
        </GiveCardProvider>
      </NopeTimerProvider>
    </GameProvider>
  );
}
