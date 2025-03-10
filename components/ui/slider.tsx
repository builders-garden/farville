"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "yellow-brown";
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        variant === "default" ? "bg-secondary" : "bg-[#5A4129]"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute h-full",
          variant === "default" ? "bg-primary" : "bg-[#FFB938]"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default"
          ? "h-5 w-5 border-primary bg-background focus-visible:ring-ring"
          : "h-6 w-6 border-[#7E4E31] bg-[#FFB938] hover:bg-[#ffc661] focus-visible:ring-[#ffc661] shadow-lg"
      )}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
