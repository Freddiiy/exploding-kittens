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
import { explodingKittenCharacters } from "@/models/characters";
import { type PlayerData } from "@/models/Player";
import { AvatarSelector, GameAvatar } from "./game-avatar";

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
                  <AvatarSelector
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                  >
                    <GameAvatar
                      src={
                        explodingKittenCharacters.find(
                          (x) => x.name === field.value,
                        )?.img ?? ""
                      }
                      fallback={form.watch("player.username").at(0) ?? ""}
                    />
                  </AvatarSelector>
                )}
              />
            </div>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
