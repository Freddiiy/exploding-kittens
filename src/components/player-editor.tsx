"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { explodingKittenCharacters } from "@/models/characters";
import { P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlayerData } from "@/models/Player";

export function PlayerEditor() {
  const form = useFormContext<{ player: PlayerData }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your character</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <Form {...form}>
            <FormField
              control={form.control}
              name="player.username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="text-xl">Username</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center gap-16">
              <FormField
                control={form.control}
                name="player.avatar"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger>
                      <Avatar className="size-16">
                        <AvatarImage
                          src={
                            explodingKittenCharacters.find(
                              (x) => x.name === field.value,
                            )?.img ?? ""
                          }
                        />
                        <AvatarFallback>
                          {form.watch("player.username")?.at(0) ?? ""}
                        </AvatarFallback>
                      </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit" showArrow>
                      <div className="grid grid-cols-3 gap-1">
                        {explodingKittenCharacters.map((character) => (
                          <Button
                            type="button"
                            variant={"ghost"}
                            className="flex h-full w-full flex-col items-center justify-center gap-2"
                            key={character.name}
                            onClick={() =>
                              character.name !== field.value
                                ? field.onChange(character.name)
                                : field.onChange("")
                            }
                          >
                            <Avatar
                              className={cn(
                                "size-16",
                                field.value === character.name &&
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
                )}
              />
            </div>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
