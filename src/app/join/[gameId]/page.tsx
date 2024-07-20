"use client";

import { H1 } from "@/components/ui/typography";

import { LobbyGameSettings } from "./lobby-game-settings";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { type PlayerOptions } from "@/models/Player";
import { generateRandomId } from "@/lib/generateRandomId";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { omitPrototype } from "@trpc/server/unstable-core-do-not-import";
import { useParams } from "next/navigation";
import { join } from "path";

export default function Page() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-12">
      <H1>Lobby</H1>
      <div>
        <LobbyGameSettings />
      </div>
    </div>
  );
}
