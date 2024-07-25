import { useDroppable } from "@dnd-kit/core";
import { useUser } from "../user-context";
import { cn } from "@/lib/utils";

export function PlayArea() {
  const { setNodeRef, isOver } = useDroppable({
    id: "play-area",
  });

  const { user } = useUser();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-[80%] min-w-[56rem] max-w-screen-2xl rounded-lg outline-dashed outline-2 outline-offset-2 outline-muted-foreground transition-all duration-300",
        isOver && "outline-green-600",
      )}
    ></div>
  );
}
