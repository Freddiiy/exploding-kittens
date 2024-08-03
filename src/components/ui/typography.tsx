"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

export function H1(props: ComponentProps<"h1">) {
  return (
    <h1
      {...props}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tighter lg:text-5xl",
        props.className,
      )}
    />
  );
}

export function H2(props: ComponentProps<"h2">) {
  return (
    <h2
      {...props}
      className={cn(
        "scroll-m-20 pb-2 text-3xl font-semibold transition-colors first:mt-0",
        props.className,
      )}
    />
  );
}

export function H3(props: ComponentProps<"h3">) {
  return (
    <h3
      {...props}
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        props.className,
      )}
    />
  );
}

export function H4(props: ComponentProps<"h4">) {
  return (
    <h4
      {...props}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        props.className,
      )}
    />
  );
}

export function H5(props: ComponentProps<"h5">) {
  return (
    <h5
      {...props}
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight",
        props.className,
      )}
    />
  );
}

export function H6(props: ComponentProps<"h6">) {
  return (
    <h6
      {...props}
      className={cn(
        "scroll-m-20 text-base font-semibold tracking-tight",
        props.className,
      )}
    />
  );
}

export function P({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("leading-7", className)} {...props} />;
}

export function Blockquote(props: ComponentProps<"blockquote">) {
  return (
    <blockquote
      {...props}
      className={cn("mt-6 border-l-2 pl-6 italic", props.className)}
    />
  );
}

export function List(props: ComponentProps<"ul">) {
  return (
    <ul
      {...props}
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", props.className)}
    />
  );
}

export function Lead(props: ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={cn("text-xl text-muted-foreground", props.className)}
    />
  );
}

export function Large({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-lg font-semibold", className)} {...props} />;
}

export function Small(props: ComponentProps<"small">) {
  return (
    <small
      {...props}
      className={cn("text-sm font-normal leading-tight", props.className)}
    />
  );
}

export function Muted(props: ComponentProps<"p">) {
  return (
    <p
      {...props}
      className={cn("text-sm text-muted-foreground", props.className)}
    />
  );
}

export function Bold(props: ComponentProps<"b">) {
  return <b {...props} className={cn("font-bold", props.className)} />;
}
