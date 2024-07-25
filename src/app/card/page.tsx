import { KittenCard } from "@/components/kittens/card";
import { generateRandomId } from "@/lib/generateRandomId";
import { CardType } from "@/models/cards/_CardType";

export default function Page() {
  const card = {
    cardId: generateRandomId(16),
    type: CardType.NOPE,
    name: "Nope",
    description: "Stop the action of another player.",
    mechanics:
      "Play any time to stop any action except for an Exploding Kitten or a Defuse card.",
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <KittenCard card={card} />
    </div>
  );
}
