"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const gameId = params.gameId as string;

  return <div>gameid: {gameId}</div>;
}
