import { AllPlayersList } from "./all-players";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="mx-auto max-w-lg pt-12">
      <AllPlayersList />
    </div>
  );
}
