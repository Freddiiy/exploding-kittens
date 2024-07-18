"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
  wsLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

function getEndingLink() {
  if (typeof window === "undefined") {
    return getStreamingLink();
  }

  return getWsLink();
}
function getStreamingLink() {
  return unstable_httpBatchStreamLink({
    transformer: SuperJSON,
    url: getBaseUrl() + "/api/trpc",
    headers: () => {
      const headers = new Headers();
      headers.set("x-trpc-source", "nextjs-react");
      return headers;
    },
  });
}

function getWsLink() {
  const client = createWSClient({
    url: getBaseWSUrl(),
  });
  return wsLink({
    client,
    transformer: SuperJSON,
  });
}

function splitTRPCLinks() {
  return splitLink({
    condition(op) {
      return op.type === "subscription";
    },
    true: getWsLink(),
    false: getStreamingLink(),
  });
}
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        getEndingLink(),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl(port = 3000) {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? port}`;
}

function getBaseWSUrl(port = 3001) {
  if (typeof window !== "undefined") {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${port}`;
    return wsUrl;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `ws://localhost:${process.env.PORT ?? port}`;
}
