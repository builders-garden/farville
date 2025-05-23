import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PowerStatsProps {
  currentPowerStage: number;
  currentFP: number;
  fpChangeAnimation: "increase" | "decrease" | null;
  nextStageInfo?: { fpRequired: number; boost: number };
  currentStageInfo: { boost: number; fpRequired: number };
}

export const PowerStats = ({
  currentPowerStage,
  currentFP,
  fpChangeAnimation,
  nextStageInfo,
  currentStageInfo,
}: PowerStatsProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <AnimatedCircularProgressBar
        max={
          nextStageInfo ? nextStageInfo.fpRequired : currentStageInfo.fpRequired
        }
        min={currentStageInfo.fpRequired}
        value={currentFP}
        gaugePrimaryColor="#FFB938"
        gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        className="w-[90px] h-[90px] rounded-full bg-[#4A341A] shadow-lg"
      >
        <div className="flex flex-col items-center justify-center h-full text-white/90 font-semibold">
          <span className="text-base leading-none">{currentPowerStage}</span>
          <span className="text-base text-yellow-400 mt-0.5">⚡</span>
        </div>
      </AnimatedCircularProgressBar>

      <div className="flex flex-col gap-1.5 items-end">
        <div className="flex items-baseline gap-1.5">
          <motion.span
            className={cn(
              "text-[1.65rem] font-bold",
              fpChangeAnimation === "increase"
                ? "text-green-500"
                : fpChangeAnimation === "decrease"
                ? "text-red-400"
                : "text-yellow-400"
            )}
            animate={
              fpChangeAnimation
                ? {
                    scale: [1, 1.2, 1],
                    y:
                      fpChangeAnimation === "increase"
                        ? [0, -10, 0]
                        : [0, 5, 0],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
          >
            {currentFP}
          </motion.span>
          <span className="text-white/60 text-xs">
            / {nextStageInfo ? nextStageInfo.fpRequired : "MAX"} FP
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/70 text-sm">Game Speed</span>
          <span className="text-amber-500 text-base font-bold">
            {currentStageInfo.boost}×
          </span>
        </div>
      </div>
    </div>
  );
};
