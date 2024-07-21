"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type CreateGameType } from "@/server/constants/createGameSchema";

import { useFormContext } from "react-hook-form";

export function GameSettings() {
  const form = useFormContext<CreateGameType>();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Game settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="settings.name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4">
                  <FormLabel className="shrink-0 text-xl">Lobby name</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="settings.publicGame"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-4">
                  <FormLabel className="shrink-0 text-xl">Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ? "public" : "private"}
                      onValueChange={(val) => field.onChange(val === "public")}
                      className="grid grid-cols-3"
                    >
                      <FormControl>
                        <div>
                          <RadioGroupItem
                            value="public"
                            id="public"
                            className="peer sr-only"
                            aria-label="Card"
                          />
                          <Label
                            htmlFor="public"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            Public
                          </Label>
                        </div>
                      </FormControl>
                      <FormControl>
                        <div>
                          <RadioGroupItem
                            value="private"
                            id="private"
                            className="peer sr-only"
                            aria-label="Card"
                          />
                          <Label
                            htmlFor="private"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            Private
                          </Label>
                        </div>
                      </FormControl>
                    </RadioGroup>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
