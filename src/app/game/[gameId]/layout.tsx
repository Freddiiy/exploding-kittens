import "@/styles/globals.css";
import { type Metadata } from "next";
import { SocketProvider } from "@/trpc/socket";
import { GameProvider } from "@/components/gameContext";

export const metadata: Metadata = {
  title: "Exploding Kittens",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SocketProvider>
      <GameProvider>{children}</GameProvider>
    </SocketProvider>
  );
}