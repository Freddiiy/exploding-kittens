import { Suspense } from "react";
import { Rooms } from "./rooms";

export default function Page() {
  return (
    <div className="mx-auto max-w-screen-lg pt-12">
      <Suspense fallback={"loading..."}>
        <Rooms />
      </Suspense>
    </div>
  );
}
