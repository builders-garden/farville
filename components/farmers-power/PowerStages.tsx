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
}

export const PowerStages = ({
  currentPowerStage,
  stages,
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
        className="border-0 bg-[#4A341A] rounded-lg px-2"
      >
        <AccordionTrigger className="py-2 text-white/90 text-sm font-semibold hover:no-underline">
          Power Stages
        </AccordionTrigger>
        <AccordionContent>
          <div
            ref={stagesContainerRef}
            className="max-h-48 overflow-y-auto pr-2 -mr-2"
          >
            {stagesFromPrevious.map((stage) => (
              <div
                key={stage.stage}
                className={cn(
                  "flex items-center justify-between p-2 rounded mb-2",
                  currentPowerStage === stage.stage
                    ? "bg-yellow-500/20 border border-yellow-400/30"
                    : currentPowerStage > stage.stage
                    ? "bg-[#4A341A]/50"
                    : "bg-[#4A341A]/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      currentPowerStage === stage.stage
                        ? "bg-yellow-500 text-[#4A341A]"
                        : currentPowerStage > stage.stage
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-[#4A341A] text-white/50"
                    )}
                  >
                    {stage.stage}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm",
                        currentPowerStage >= stage.stage
                          ? "text-white/90"
                          : "text-white/50"
                      )}
                    >
                      {stage.boost}× Boost
                    </span>
                    <span className="text-xs text-white/50">
                      {stage.fpRequired} FP
                    </span>
                  </div>
                </div>
                {currentPowerStage === stage.stage && (
                  <span className="text-yellow-400 text-xs font-medium">
                    Current
                  </span>
                )}
                {currentPowerStage > stage.stage && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
