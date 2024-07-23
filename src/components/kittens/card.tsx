"use client";

import { cn } from "@/lib/utils";
import { CardType } from "@/models/cards/_CardType";
import Image from "next/image";
import { type ReactNode, createContext, useContext } from "react";

interface KittenCardProps {
  cardId: string;
  type: CardType;
  name: string;
  description: string;
  mechanics: string;
}

export function KittenCard({ ...props }: KittenCardProps) {
  return (
    <KittenCardContext.Provider value={{ ...props }}>
      <div className="w-80 rounded-xl border-2 border-black bg-background">
        <div className="rounded-md p-4">
          <div className="flex flex-col gap-2 rounded-xl border-4 border-pink-400 p-2">
            <KittenCardHeader />
            <div className="relative h-96 flex-shrink-0">
              <Image
                src={"/characters/angry_devil_cat.png"}
                alt="Card artwork"
                fill
                className="rounded-md"
              />
            </div>
            <KittenCardHeader flipped />
          </div>
        </div>
      </div>
    </KittenCardContext.Provider>
  );
}

interface KittenCardHeaderProps {
  flipped?: boolean;
}
function KittenCardHeader({ flipped }: KittenCardHeaderProps) {
  const cardCtx = useKittenCard();
  return (
    <div className={cn("flex gap-2", flipped && "rotate-180")}>
      <div className="flex-shrink-0">
        <Image
          src={"/placeholder"}
          alt="icon"
          height={50}
          width={50}
          className="aspect-square rounded-full"
        />
      </div>
      <div className={cn("flex flex-col", flipped && "justify-center")}>
        <h3 className="text-2xl font-medium uppercase tracking-normal">
          {cardCtx.name}
        </h3>
        {!flipped && (
          <p className="text-base font-thin uppercase leading-4 tracking-wide text-muted-foreground">
            {cardCtx.description}
          </p>
        )}
      </div>
    </div>
  );
}

const KittenCardContext = createContext<KittenCardProps | null>(null);

function useKittenCard() {
  const kittenCardCtx = useContext(KittenCardContext);
  if (!kittenCardCtx) {
    throw new Error(
      "Kitten context must be used inside <KittenCard></KittenCard>",
    );
  }

  return kittenCardCtx;
}
