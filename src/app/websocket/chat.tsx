"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export function Chat() {
  const [messages, setMessage] = useState<string[]>([]);

  api.game.onAdd.useSubscription(undefined, {
    onStarted: () => {
      console.log("Subscription started");
    },
    onData(message) {
      console.log("New message:", message);
      setMessage((prev) => prev.concat(message.text));
    },
    onError(err) {
      console.error("Subscription error:", err.message);
      setMessage((prev) => prev.concat(err.message));
    },
  });

  return (
    <div className="border-2 border-black py-2">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
