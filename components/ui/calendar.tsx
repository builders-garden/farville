"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 !border-2 !rounded-2xl border-[#8b5d3c] bg-[#6D4C2C]",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-white",
        month: "space-y-4",
        caption: "flex pt-1 relative justify-between mx-3 mr-0 items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "default" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#7E4E31]"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-fit mx-auto !mt-4 !mb-1 border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-amber-500/90 rounded-md w-full font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "mx-1 h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 pointer-events-none bg-[#5a4129]"
        ),
        day_range_end: "day-range-end",
        day_selected: "!bg-[#FFB938] text-[#7e4e31]",
        day_today: "outline outline-[2px] outline-offset-2 outline-[#ffb938]",
        day_outside: "day-outside text-[#3e2600] aria-selected:text-[#3e2600]",
        day_disabled:
          "day-disabled text-white !opacity-100 bg-gradient-to-br from-[#1786E4] to-[#0698D6]",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn("h-4 w-4", className)}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn("h-4 w-4", className)}
            {...props}
          />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
