import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface PowerTimerProps {
  powerCombo: number;
  lastDonationTime: Date | null;
  timerNow: number;
  COMBO_WINDOW: number;
}

export const PowerTimer = ({
  powerCombo,
  lastDonationTime,
  timerNow,
  COMBO_WINDOW,
}: PowerTimerProps) => {
  if (!lastDonationTime) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg p-3",
        powerCombo > 1
          ? "bg-gradient-to-br from-[#4A341A] via-[#5A442A] to-[#4A341A] relative overflow-hidden"
          : "bg-[#4A341A]"
      )}
    >
      {powerCombo > 1 && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-400/10">
          <motion.div
            className="w-[200%] h-full absolute"
            style={{
              backgroundImage:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      )}
      <div className="flex flex-col items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 text-white/80">
          <Clock
            size={16}
            className={cn(
              powerCombo > 1 ? "text-yellow-400" : "text-[#FFB938]"
            )}
          />
          <span className="text-[10px]">FP decrease in:</span>
        </div>
        <motion.div
          className="flex gap-1 text-white font-bold w-full"
          animate={{
            opacity: powerCombo > 1 ? [1, 0.7, 1] : [1, 0.8, 1],
          }}
          transition={{
            duration: powerCombo > 1 ? 0.8 : 0.5,
            repeat: Infinity,
          }}
        >
          <TimeUnit
            value={Math.max(
              0,
              Math.floor(
                (COMBO_WINDOW - (timerNow - lastDonationTime.getTime())) /
                  (1000 * 60)
              )
            )}
            powerCombo={powerCombo}
          />
          <span
            className={cn(
              "flex items-center",
              powerCombo > 1 ? "text-yellow-400" : "text-[#FFB938]"
            )}
          >
            :
          </span>
          <TimeUnit
            value={Math.max(
              0,
              Math.floor(
                ((COMBO_WINDOW - (timerNow - lastDonationTime.getTime())) %
                  (1000 * 60)) /
                  1000
              )
            )}
            powerCombo={powerCombo}
          />
          <span
            className={cn(
              "flex items-center",
              powerCombo > 1 ? "text-yellow-400" : "text-[#FFB938]"
            )}
          >
            :
          </span>
          <TimeUnit
            value={Math.max(
              0,
              Math.floor(
                ((COMBO_WINDOW - (timerNow - lastDonationTime.getTime())) %
                  1000) /
                  10
              )
            )}
            powerCombo={powerCombo}
          />
        </motion.div>

        {powerCombo > 1 && (
          <motion.div
            className="w-full text-center text-yellow-400 text-sm font-semibold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Power Combo: ×{powerCombo}
          </motion.div>
        )}
      </div>

      <BurningFuse
        lastDonationTime={lastDonationTime}
        COMBO_WINDOW={COMBO_WINDOW}
      />
    </div>
  );
};

const TimeUnit = ({
  value,
  powerCombo,
}: {
  value: number;
  powerCombo: number;
}) => (
  <div
    className={cn(
      "px-2 py-1 rounded-md text-xs w-full flex items-center justify-center",
      powerCombo > 1
        ? "bg-[#5C4121]/80 border border-yellow-400/20"
        : "bg-[#5C4121]"
    )}
  >
    {value.toString().padStart(2, "0")}
  </div>
);

const BurningFuse = ({
  lastDonationTime,
  COMBO_WINDOW,
}: {
  lastDonationTime: Date;
  COMBO_WINDOW: number;
}) => (
  <div className="relative">
    <div className="h-2 bg-[#2A1E12] rounded-full relative">
      <motion.div
        key={lastDonationTime ? lastDonationTime.getTime() : "initial"}
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
        style={{
          width: `${Math.max(
            0,
            ((COMBO_WINDOW - (Date.now() - lastDonationTime.getTime())) /
              COMBO_WINDOW) *
              98
          )}%`,
        }}
        animate={{
          width: "2%",
        }}
        transition={{
          duration: Math.max(
            0,
            (COMBO_WINDOW - (Date.now() - lastDonationTime.getTime())) / 1000
          ),
          ease: "linear",
        }}
      >
        <div className="absolute right-[-8px] top-1/2 -translate-y-1/2">
          <motion.div
            className="w-4 h-4 rounded-full bg-yellow-300 shadow-lg shadow-yellow-400/80"
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 10px 2px rgba(250, 204, 21, 0.8)",
                "0 0 15px 4px rgba(250, 204, 21, 0.9)",
                "0 0 10px 2px rgba(250, 204, 21, 0.8)",
              ],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <SparkParticle
            delay={0}
            x={[-2, 8]}
            y={[-8, 8]}
          />
          <SparkParticle
            delay={0.15}
            x={[2, 7]}
            y={[-6, 4]}
          />
          <SparkParticle
            delay={0.3}
            x={[-3, 5]}
            y={[-4, 6]}
          />
        </div>
      </motion.div>
    </div>

    {COMBO_WINDOW - (Date.now() - lastDonationTime.getTime()) <= 0 && (
      <motion.div
        className="absolute inset-0 bg-yellow-400"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.8, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
      />
    )}
  </div>
);

const SparkParticle = ({
  delay,
  x,
  y,
}: {
  delay: number;
  x: [number, number];
  y: [number, number];
}) => (
  <motion.div
    className="absolute top-1/2 right-1/2 w-2.5 h-2.5 rounded-full bg-yellow-300"
    animate={{
      y,
      x,
      opacity: [1, 0],
      scale: [1.2, 0.6],
      rotate: [-45, 45],
    }}
    transition={{
      duration: 0.8,
      repeat: Infinity,
      ease: "easeOut",
      delay,
      repeatDelay: 0.2,
    }}
  />
);
