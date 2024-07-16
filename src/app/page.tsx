import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { KittenCard } from "@/components/kittens/card";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <KittenCard
          cardId="1"
          title="Attack"
          subtitle="Grow a Magnificent squid arm and start slapping fat babies"
          icon="https://explodi.ng/images/cards/attack-2x/attack-2x.png"
          description="End your turn without drawing a card. Force the next player to take two turns"
          imgSrc="https://explodi.ng/images/cards/attack-2x/artworks/Attack-Grow-a-Magnifient-Squid-Arm-and-Start-Slapping-Fat-Babies.jpg"
        />
      </main>
    </HydrateClient>
  );
}
