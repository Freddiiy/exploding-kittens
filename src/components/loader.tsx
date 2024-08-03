"use state";
import { useState } from "react";

const Loader = ({ invisibleIn }: { invisibleIn?: number }) => {
  const [visible, setVisible] = useState<boolean>(false);
  setTimeout(() => setVisible(true), invisibleIn ?? 0);
  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center gap-1.5 ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-1000`}
    >
      <div className={"h-2 w-2 animate-bounce rounded-full bg-primary"}>
        <div
          className={
            "absolute h-full w-full rounded-full border-2 border-primary"
          }
        />
      </div>
      <div
        className={"h-2 w-2 animate-bounce rounded-full bg-primary"}
        style={{
          animationDelay: "333ms",
        }}
      >
        <div
          className={
            "absolute h-full w-full rounded-full border-2 border-primary"
          }
          style={{
            animationDelay: "333ms",
          }}
        />
      </div>
      <div
        className={"h-2 w-2 animate-bounce rounded-full bg-primary"}
        style={{
          animationDelay: "666ms",
        }}
      >
        <div
          className={
            "absolute h-full w-full rounded-full border-2 border-primary"
          }
          style={{
            animationDelay: "666ms",
          }}
        />
      </div>
    </div>
  );
};

export const FirstLoader = () => {
  return (
    <div
      className={`relative flex h-20 w-20 items-center justify-center gap-1.5`}
    >
      <div className={"bg-brand-primary h-2 w-2 animate-bounce rounded-full"}>
        <div
          className={
            "border-brand-primary absolute h-full w-full animate-ping rounded-full border-2"
          }
        />
      </div>
      <div
        className={"bg-brand-primary h-2 w-2 animate-bounce rounded-full"}
        style={{
          animationDelay: "333ms",
        }}
      >
        <div
          className={
            "border-brand-primary absolute h-full w-full animate-ping rounded-full border-2"
          }
          style={{
            animationDelay: "333ms",
          }}
        />
      </div>
      <div
        className={"bg-brand-primary h-2 w-2 animate-bounce rounded-full"}
        style={{
          animationDelay: "666ms",
        }}
      >
        <div
          className={
            "border-brand-primary absolute h-full w-full animate-ping rounded-full border-2"
          }
          style={{
            animationDelay: "666ms",
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
