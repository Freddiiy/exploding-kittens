"use client";

import { api } from "@/trpc/react";

export function Chat() {
  const [_messages] = api.messages.get.useSuspenseQuery();

  const utils = api.useUtils();

  api.messages.onAdd.useSubscription(undefined, {
    onData(message) {
      utils.messages.get.setData(undefined, (prevMessages) => {
        // Assuming existingMessages is an array
        return prevMessages?.concat(message);
      });
    },
    onError(err) {
      console.error("Subscription error:", err.message);
      utils.messages.get.setData(undefined, (prevMessages) => {
        // Assuming existingMessages is an array
        return prevMessages?.concat({ id: "error", text: err.message });
      });
    },
  });

  return (
    <div className="border-2 border-black py-2">
      {_messages.map((message, i) => (
        <p key={i}>{message.text}</p>
      ))}
    </div>
  );
}
