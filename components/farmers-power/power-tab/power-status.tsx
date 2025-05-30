import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { HowItWorks } from "./how-it-works";

interface PowerStatsProps {
  currentFP: number;
  fpChangeAnimation: "increase" | "decrease" | null;
  nextStageInfo?: { fpRequired: number; boost: number };
  currentStageInfo: { boost: number; fpRequired: number };
  isFarcasterManiaOn: boolean;
}

export const PowerStats = ({
  currentFP,
  fpChangeAnimation,
  nextStageInfo,
  currentStageInfo,
  isFarcasterManiaOn,
}: PowerStatsProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <AnimatedCircularProgressBar
        max={
          nextStageInfo
            ? nextStageInfo?.fpRequired
            : currentStageInfo.fpRequired
        }
        min={currentStageInfo.fpRequired}
        value={currentFP}
        gaugePrimaryColor={isFarcasterManiaOn ? "#a590e3" : "#FFB938"}
        gaugeSecondaryColor="rgba(0, 0, 0, 0.3)"
        className="w-[130px] h-[130px] rounded-full bg-[#4A341A] shadow-lg"
      >
        <div className="flex flex-col items-center justify-center h-full text-white/90 font-semibold gap-1">
          <span className="text-sm leading-none">
            {currentStageInfo.boost}x
          </span>
          <span className="text-xs leading-none text-white/60">Speed</span>
        </div>
      </AnimatedCircularProgressBar>

      <div className="flex flex-col items-end gap-6">
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-baseline gap-1 leading-none">
            <motion.span
              className={cn(
                "text-[1.75rem] font-bold",
                fpChangeAnimation === "increase"
                  ? "text-green-500"
                  : fpChangeAnimation === "decrease"
                  ? "text-red-400"
                  : isFarcasterManiaOn
                  ? "text-[#a590e3]"
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
            <span className="text-white/90 text-sm self-end">FP</span>
          </div>
          {nextStageInfo && (
            <div className="text-[10px] text-white/60 leading-none">
              Next: {nextStageInfo.fpRequired} FP
            </div>
          )}
          {!nextStageInfo && (
            <div className="text-xs text-white/60">MAX FP</div>
          )}
        </div>
        <HowItWorks isFarcasterManiaOn={isFarcasterManiaOn} />
      </div>
    </div>
  );
};
