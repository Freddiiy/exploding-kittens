import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { KittenCard } from "@/components/kittens/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="max-w-screen-xl">
          <h2 className="text-8xl font-bold">
            <span className="text-clip bg-gradient-to-t from-red-700 to-yellow-600 bg-clip-text text-transparent">
              EXPLODING
            </span>{" "}
            KITTENS
          </h2>
          <div className="flex w-full flex-col gap-4 pt-12">
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
            >
              Play
            </Button>
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
            >
              Join game
            </Button>
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
            >
              Create game
            </Button>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
