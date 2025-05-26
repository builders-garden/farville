import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRef } from "react";

interface PowerStage {
  stage: number;
  fpRequired: number;
  boost: number;
}

interface PowerStagesProps {
  currentPowerStage: number;
  stages: PowerStage[];
  isFarcasterManiaOn: boolean;
}

export const PowerStages = ({
  currentPowerStage,
  stages,
  isFarcasterManiaOn,
}: PowerStagesProps) => {
  const stagesContainerRef = useRef<HTMLDivElement>(null);
  const stagesFromPrevious = stages.slice(Math.max(0, currentPowerStage - 2));

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
    >
      <AccordionItem
        value="stages"
        className="border-0 bg-[#4A341A] rounded-lg px-2 shadow-md"
      >
        <AccordionTrigger className="py-2 px-1 text-white/90 text-xs font-semibold hover:no-underline group">
          Power Stages
        </AccordionTrigger>
        <AccordionContent>
          <div
            ref={stagesContainerRef}
            className="max-h-48 overflow-y-auto pr-2 -mr-2 no-scrollbar"
          >
            {stagesFromPrevious.map((stage) => (
              <div
                key={stage.stage}
                className={cn(
                  "flex items-center justify-between p-2 rounded mb-2 transition-all duration-200",
                  currentPowerStage === stage.stage
                    ? isFarcasterManiaOn
                      ? "bg-[#a590e3]/20 border border-[#a590e3]/50 shadow-sm shadow-[#a590e3]/10"
                      : "bg-yellow-500/20 border border-yellow-400/50 shadow-sm shadow-yellow-500/10"
                    : currentPowerStage > stage.stage
                    ? "bg-[#4A341A]/50"
                    : "bg-[#4A341A]/20"
                )}
              >
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center text-xs font-bold px-3 py-1.5 transition-all duration-200",
                    currentPowerStage === stage.stage
                      ? isFarcasterManiaOn
                        ? "bg-[#a590e3] text-white shadow-sm shadow-[#a590e3]/30"
                        : "bg-yellow-500 text-[#4A341A] shadow-sm shadow-yellow-500/30"
                      : currentPowerStage > stage.stage
                      ? isFarcasterManiaOn
                        ? "bg-[#a590e3]/20 text-[#a590e3]"
                        : "bg-yellow-500/20 text-yellow-400"
                      : "bg-[#4A341A] text-white/50 border border-white/20"
                  )}
                >
                  {stage.boost}× Boost
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs transition-all duration-200",
                      currentPowerStage === stage.stage
                        ? isFarcasterManiaOn
                          ? "text-[#a590e3] font-medium"
                          : "text-yellow-400 font-medium"
                        : currentPowerStage > stage.stage
                        ? "text-green-400"
                        : "text-white/50"
                    )}
                  >
                    {stage.fpRequired} FP
                    {currentPowerStage === stage.stage && (
                      <span className="ml-1 inline-block animate-pulse w-4">
                        •
                      </span>
                    )}
                    {currentPowerStage > stage.stage && (
                      <span className="ml-1 inline-block w-4">✅</span>
                    )}
                    {currentPowerStage < stage.stage && (
                      <span className="ml-1 inline-block w-4">❌</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
