import { AllPlayersList } from "./all-players";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={"loading..."}>
        <AllPlayersList />
      </Suspense>
    </div>
  );
}
