import { Bebas_Neue, Inter } from "next/font/google";
import { type Metadata } from "next";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/components/user-context";

import "@/styles/globals.css";
import { SocketProvider } from "@/trpc/socket";

export const metadata: Metadata = {
  title: "Exploding kittens",
  description: "Exploding kittens online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const bebas_neue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          bebas_neue.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <SocketProvider>{children}</SocketProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
