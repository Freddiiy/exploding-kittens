import { type Metadata } from "next";
import { SocketProvider } from "@/trpc/socket";

export const metadata: Metadata = {
  title: "Exploding Kittens",
  description: "Exploding kittens online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SocketProvider>{children}</SocketProvider>;
}
