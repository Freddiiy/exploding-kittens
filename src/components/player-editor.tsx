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
import { Label } from "./ui/label";

interface PlayerEditorInterface {
  player: PlayerData;
  onPlayerChange: (player: PlayerData) => void;
}
export function PlayerEditor({
  player,
  onPlayerChange,
}: PlayerEditorInterface) {
  function handleUsernameChange(newUsername: string) {
    onPlayerChange({
      ...player,
      username: newUsername,
    });
  }
  function handleAvatarChange(newAvatar: string) {
    onPlayerChange({
      ...player,
      avatar: newAvatar,
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your character</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Label className="text-xl">Username</Label>
            <Input
              value={player.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-center gap-16">
            <AvatarSelector
              value={player.avatar}
              onChange={(e) => handleAvatarChange(e)}
            >
              <GameAvatar
                src={
                  explodingKittenCharacters.find(
                    (x) => x.name === player.avatar,
                  )?.img ?? ""
                }
              />
            </AvatarSelector>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
