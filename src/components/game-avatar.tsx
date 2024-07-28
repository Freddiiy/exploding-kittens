import { explodingKittenCharacters } from "@/models/characters";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { type ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { P } from "./ui/typography";
import { type PlayerData } from "@/models/Player";

interface PlayerAvatarProps {
  user: Omit<PlayerData, "userId">;
  size?: "default" | "lg" | "sm" | "xs";
}
export function PlayerAvatar({ user, size = "default" }: PlayerAvatarProps) {
  const src =
    explodingKittenCharacters.find((c) => c.name === user.avatar)?.img ?? "";
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <GameAvatar
        src={src}
        fallback={user.username.at(0) ?? ""}
        className={cn(
          size === "lg" && "size-24",
          size === "sm" && "size-12",
          size === "xs" && "size-6",
        )}
      />
      <P className="max-w-20 truncate text-nowrap">{user.username}</P>
    </div>
  );
}

interface GameAvatarProps {
  src: string;
  fallback: string;
  className?: string;
}

export function GameAvatar({ src, fallback, className }: GameAvatarProps) {
  return (
    <Avatar className={cn("size-16", className)}>
      <AvatarImage src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

interface AvatarSelectorProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}
export function AvatarSelector({
  value,
  onChange,
  children,
}: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="w-fit" showArrow>
        <div className="grid grid-cols-3 gap-1">
          {explodingKittenCharacters.map((character) => (
            <Button
              type="button"
              variant={"ghost"}
              className="flex h-full w-full flex-col items-center justify-center gap-2"
              key={character.name}
              onClick={() => {
                character.name !== value
                  ? onChange(character.name)
                  : onChange("");
                setIsOpen(false);
              }}
            >
              <Avatar
                className={cn(
                  "size-16",
                  value === character.name &&
                    "ring ring-primary ring-offset-2 ring-offset-background transition-all duration-150",
                )}
              >
                <AvatarImage src={character.img} />
              </Avatar>
              <P>{character.name}</P>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
