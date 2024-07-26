import { useDroppable } from "@dnd-kit/core";
import { useUser } from "../user-context";
import { cn } from "@/lib/utils";

export function PlayArea() {
  const { setNodeRef, isOver } = useDroppable({
    id: "play-area",
  });

  const { user } = useUser();

  return (
    <div className="mx-auto">
      <div className="flex transform-none justify-center gap-4">
        <div
          ref={setNodeRef}
          className={cn(
            "relative flex h-card-height w-card-width items-center justify-center rounded-lg outline-dashed outline-2 outline-offset-2 outline-white",
            isOver && "outline-green-600",
          )}
        ></div>
      </div>
    </div>
  );
}
