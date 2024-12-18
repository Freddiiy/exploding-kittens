import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="max-w-screen-xl">
          <h2 className="text-8xl font-bold">
            <span className="text-clip bg-gradient-to-t from-red-700 via-red-500 to-yellow-400 bg-clip-text text-transparent">
              EXPLODING
            </span>{" "}
            KITTENS
          </h2>
          <div className="flex w-full flex-col gap-4 pt-12">
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
              asChild
            >
              <Link href={"/game"}>Play</Link>
            </Button>
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
              asChild
            >
              <Link href={"/game"}>Join game</Link>
            </Button>
            <Button
              type="button"
              variant={"link"}
              size={"full"}
              className="text-4xl"
              asChild
            >
              <Link href={"/create"}> Create game</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
