"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        "p-[0.7rem] pb-4 !border-2 !rounded-2xl border-[#8b5d3c] bg-[#6D4C2C]",
        className
      )}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 text-white",
        month: "space-y-4",
        caption:
          "flex pt-1 relative justify-between ml-[0.5rem] mr-0 items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "default" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-[#7E4E31]"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full mx-auto !mt-4 !mb-1 border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-amber-500/90 rounded-md w-full font-normal text-[0.7rem]",
        row: "flex w-full mt-[0.6rem]",
        cell: "mx-[0.3rem] h-8 w-full text-center !text-[0.5rem] p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-full p-0 font-normal aria-selected:opacity-100 pointer-events-none bg-[#5a4129] !text-[0.7rem]"
        ),
        day_range_end: "day-range-end",
        day_selected: "!bg-[#FFB938] text-[#7e4e31]",
        day_today:
          "outline outline-[2px] outline-offset-2 outline-[#ffb938] text-yellow-500",
        day_outside: "day-outside text-[#6D4C2C] aria-selected:text-[#3e2600]",
        day_disabled:
          "day-disabled text-white !opacity-100 bg-gradient-to-br from-[#1786E4] to-[#0698D6]",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
