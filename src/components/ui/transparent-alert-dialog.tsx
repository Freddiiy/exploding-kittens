"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const TransparentAlertDialog = AlertDialogPrimitive.Root;

const TransparentAlertDialogTrigger = AlertDialogPrimitive.Trigger;

const TransparentAlertDialogPortal = AlertDialogPrimitive.Portal;

const TransparentAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
TransparentAlertDialogOverlay.displayName =
  AlertDialogPrimitive.Overlay.displayName;

const TransparentAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TransparentAlertDialogPortal>
    <TransparentAlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-full translate-x-[-50%] translate-y-[-50%] gap-4 border-0 bg-transparent p-6 shadow-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </TransparentAlertDialogPortal>
));
TransparentAlertDialogContent.displayName =
  AlertDialogPrimitive.Content.displayName;

const TransparentAlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col items-center space-y-2 text-center text-white sm:text-left",
      className,
    )}
    {...props}
  />
);
TransparentAlertDialogHeader.displayName = "AlertDialogHeader";

const TransparentAlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
TransparentAlertDialogFooter.displayName = "AlertDialogFooter";

const TransparentAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("max-w-lg text-4xl font-semibold", className)}
    {...props}
  />
));
TransparentAlertDialogTitle.displayName =
  AlertDialogPrimitive.Title.displayName;

const TransparentAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
TransparentAlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const TransparentAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
TransparentAlertDialogAction.displayName =
  AlertDialogPrimitive.Action.displayName;

const TransparentAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className,
    )}
    {...props}
  />
));
TransparentAlertDialogCancel.displayName =
  AlertDialogPrimitive.Cancel.displayName;

export {
  TransparentAlertDialog,
  TransparentAlertDialogPortal,
  TransparentAlertDialogOverlay,
  TransparentAlertDialogTrigger,
  TransparentAlertDialogContent,
  TransparentAlertDialogHeader,
  TransparentAlertDialogFooter,
  TransparentAlertDialogTitle,
  TransparentAlertDialogDescription,
  TransparentAlertDialogAction,
  TransparentAlertDialogCancel,
};
