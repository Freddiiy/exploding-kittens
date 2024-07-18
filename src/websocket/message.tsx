"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Chat } from "./chat";

export function Messages() {
  const [value, setValue] = useState("");

  const addPost = api.messages.add.useMutation({
    onSuccess: () => setValue(""),
  });

  function postMessage() {
    addPost.mutate({ text: value });
  }

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          postMessage();
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border-2 border-black"
        />
        <button>send</button>
      </form>
    </div>
  );
}
