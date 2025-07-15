import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
import { POWER_STAGES } from "@/lib/game-constants";
import { getCurrentPowerStage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MilestoneCardProps {
  currentFP: number;
  isFarcasterManiaOn: boolean;
}

export const MilestoneCard = ({
  currentFP,
  isFarcasterManiaOn,
}: MilestoneCardProps) => {
  // Don't show milestone card for FP = 0
  if (currentFP === 0) return null;

  // Find the current stage based on FP
  const nextStageIndex = getCurrentPowerStage(currentFP);
  const currentStageIndex = nextStageIndex - 1;
  const currentStage = POWER_STAGES[currentStageIndex];

  if (!currentStage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Background with gradient and glow */}
      <div
        className={cn(
          "relative rounded-lg p-4 border",
          isFarcasterManiaOn
            ? "bg-gradient-to-br from-[#2A1E3A] via-[#3A2B4A] to-[#4A3B5A] border-[#a590e3]/50"
            : "bg-[#5C4121]/50 border-yellow-400/20"
        )}
      >
        {/* Pulsing border glow */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg",
            isFarcasterManiaOn
              ? "shadow-lg shadow-[#a590e3]/20"
              : "shadow-lg shadow-yellow-400/10"
          )}
          animate={{
            boxShadow: isFarcasterManiaOn
              ? [
                  "0 0 10px 2px rgba(165, 144, 227, 0.2)",
                  "0 0 15px 4px rgba(165, 144, 227, 0.4)",
                  "0 0 10px 2px rgba(165, 144, 227, 0.2)",
                ]
              : [
                  "0 0 5px 1px rgba(250, 204, 21, 0.1)",
                  "0 0 10px 2px rgba(250, 204, 21, 0.2)",
                  "0 0 5px 1px rgba(250, 204, 21, 0.1)",
                ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {currentStage.stage === POWER_STAGES.length ? (
              <Crown
                size={24}
                className={cn(
                  "drop-shadow-lg",
                  isFarcasterManiaOn ? "text-[#a590e3]" : "text-yellow-400"
                )}
              />
            ) : (
              <Trophy
                size={24}
                className={cn(
                  "drop-shadow-lg",
                  isFarcasterManiaOn ? "text-[#a590e3]" : "text-yellow-400"
                )}
              />
            )}
          </motion.div>

          {/* Text content */}
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-1">
              Power locked at {currentFP} FP
            </p>
            <motion.p
              className="text-white/60 text-xs italic"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {currentStage.stage === POWER_STAGES.length
                ? "You are the ultimate farmer! 🌟"
                : "Keep contributing to reach the next milestone!"}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
