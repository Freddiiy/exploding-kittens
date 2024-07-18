import { api, HydrateClient } from "@/trpc/server";
import { Messages } from "./message";
import { Suspense } from "react";
import { Chat } from "./chat";

export default function Home() {
  void api.messages.get.prefetch();
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <Chat />
          </Suspense>
        </div>
        <Messages />
      </main>
    </HydrateClient>
  );
}
