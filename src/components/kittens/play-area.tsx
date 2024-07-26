import { useDroppable } from "@dnd-kit/core";
import { useUser } from "../user-context";
import { cn } from "@/lib/utils";
import { H2, H3 } from "../ui/typography";
import { KittenCardBackface } from "./card";
import { darwCard } from "@/lib/actions";
import { useGame } from "../game-provider";

export function PlayArea() {
  const { gameState } = useGame();
  const { setNodeRef: discardRef, isOver: isOverDiscard } = useDroppable({
    id: "disard-pile",
  });

  const { setNodeRef: drawRef, isOver: isOverDraw } = useDroppable({
    id: "draw-pile",
  });

  const { user } = useUser();

  return (
    <div className="mx-auto">
      <div className="flex transform-none justify-center gap-8">
        <div
          ref={discardRef}
          className={cn(
            "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-white transition-all duration-300",
            isOverDiscard && "is-over outline-green-600",
          )}
        >
          <H2 className="text-4xl group-[.is-over]:text-green-600">
            Discard pile
          </H2>
        </div>
        <button
          ref={drawRef}
          className={cn(
            "group relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-white transition-all duration-300",
            isOverDraw && "is-over outline-green-600",
          )}
        >
          <button
            className="absolute inset-0"
            onClick={() => {
              if (gameState) {
                darwCard(gameState?.id, user.userId);
              }
            }}
          >
            <KittenCardBackface />
          </button>
          <H2 className="text-4xl group-[.is-over]:text-green-600">
            Draw pile
          </H2>
        </button>
      </div>
    </div>
  );
}
