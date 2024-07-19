import { Suspense } from "react";
import { Rooms } from "./rooms";

export default function Page() {
  return (
    <div>
      <Suspense fallback={"loading..."}>
        <Rooms />
      </Suspense>
    </div>
  );
}
