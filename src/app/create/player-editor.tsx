"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { explodingKittenCharacters } from "@/models/characters";
import { P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

const playerEditorSchema = z.object({
  username: z.string().min(3),
  avatar: z.string(),
});

type PlayerEditorType = z.infer<typeof playerEditorSchema>;
export function PlayerEditor() {
  const form = useForm<PlayerEditorType>({
    defaultValues: {
      username: "",
    },
    resolver: zodResolver(playerEditorSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your character</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="text-xl">Username</FormLabel>
                    <Input {...field} autoComplete="off" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-center gap-16">
              <Popover>
                <PopoverTrigger>
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {form.watch("username")?.at(0) ?? ""}
                    </AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-fit">
                  <div className="grid grid-cols-3 gap-8">
                    {explodingKittenCharacters.map((character) => (
                      <Button
                        variant={"ghost"}
                        className="flex h-full w-full flex-col items-center justify-center gap-2"
                        key={character.name}
                      >
                        <Avatar className="size-16">
                          <AvatarImage src={character.img} />
                        </Avatar>
                        <P>{character.name}</P>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
