import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  src?: string;
}

function copyToClipboard(value: string) {
  void navigator.clipboard.writeText(value);
}

function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 3000);
  }, [hasCopied]);

  return (
    <Button
      type={"button"}
      size="icon"
      variant="outline"
      className={cn("relative z-10 h-6 w-6 text-primary", className)}
      onClick={() => {
        copyToClipboard(value);
        setHasCopied(true);
      }}
      {...props}
    >
      <span className={"sr-only"}>Copy</span>
      {hasCopied ? (
        <CheckIcon className={"h-3 w-3"} />
      ) : (
        <CopyIcon className={"h-3 w-3"} />
      )}
    </Button>
  );
}

export { CopyButton };
