import { Suspense } from "react";
import { Rooms } from "./rooms";
import { H1 } from "@/components/ui/typography";

export default function Page() {
  return (
    <div className="mx-auto max-w-screen-lg pt-12">
      <H1>Games list</H1>
      <Suspense fallback={"loading..."}>
        <Rooms />
      </Suspense>
    </div>
  );
}
