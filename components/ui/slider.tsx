"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";
import { hapticsImpactOccurred } from "@/lib/farcaster";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "yellow-brown" | "farcaster-mania";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", onValueChange, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    onValueChange={async (value) => {
      // Call the original onValueChange if provided
      onValueChange?.(value);

      // Trigger haptic feedback
      await hapticsImpactOccurred("light");
    }}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        variant === "default" ? "bg-secondary" : "bg-[#5A4129]" // Brown for both yellow-brown and farcaster-mania
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute h-full",
          variant === "farcaster-mania"
            ? "bg-[#a590e3]"
            : variant === "yellow-brown"
            ? "bg-[#FFB938]"
            : "bg-primary"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "farcaster-mania"
          ? "h-6 w-6 border-[#7E4E31] bg-[#a590e3] hover:bg-[#c3b3f3] focus-visible:ring-[#a590e3] shadow-lg" // Purple theme, brown border
          : variant === "yellow-brown"
          ? "h-6 w-6 border-[#7E4E31] bg-[#FFB938] hover:bg-[#ffc661] focus-visible:ring-[#ffc661] shadow-lg" // Yellow theme, brown border
          : "h-5 w-5 border-primary bg-background focus-visible:ring-ring" // Default theme
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
