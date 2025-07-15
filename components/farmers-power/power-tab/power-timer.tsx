import {
  cn,
  getCurrentPowerStage,
  getCurrentPowerStateTarget,
} from "@/lib/utils";
import { POWER_STAGES } from "@/lib/game-constants";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useGame } from "@/context/GameContext";

interface PowerTimerProps {
  powerCombo: number;
  lastDonationTime: Date | null;
  COMBO_WINDOW: number;
  setPowerCombo: React.Dispatch<React.SetStateAction<number>>;
  setCurrentFP: React.Dispatch<React.SetStateAction<number>>;
  lastTimerReset: Date;
  setLastTimerReset: React.Dispatch<React.SetStateAction<Date>>;
  isFarcasterManiaOn: boolean;
}

// Helper function to get conditional styling based on power combo
const usePowerComboStyles = (
  powerCombo: number,
  isFarcasterManiaOn: boolean
) => {
  return useMemo(
    () => ({
      text: isFarcasterManiaOn
        ? "text-[#a590e3]"
        : powerCombo > 1
        ? "text-yellow-400"
        : "text-[#FFB938]",
      background:
        powerCombo > 1
          ? "bg-gradient-to-br from-[#4A341A] via-[#5A442A] to-[#4A341A] relative overflow-hidden"
          : "bg-[#4A341A]",
      timeUnit:
        powerCombo > 1
          ? "bg-[#5C4121]/80 border border-yellow-400/20"
          : "bg-[#5C4121]",
    }),
    [powerCombo, isFarcasterManiaOn]
  );
};

export const PowerTimer = ({
  powerCombo,
  lastDonationTime,
  COMBO_WINDOW,
  setPowerCombo,
  setCurrentFP,
  lastTimerReset,
  setLastTimerReset,
  isFarcasterManiaOn,
}: PowerTimerProps) => {
  const [timerNow, setTimerNow] = useState(Date.now());
  const styles = usePowerComboStyles(powerCombo, isFarcasterManiaOn);

  // We also need to check isFarmersPowerOn, so we need to update the PowerTimer component to receive this prop
  const { state } = useGame();
  const isFarmersPowerOn = state?.isFarmersPowerOn;

  // Effect for updating timer display - only if Farmers Power is active
  useEffect(() => {
    // Don't run timer if Farmers Power is not active
    if (!isFarmersPowerOn) return;

    const displayInterval = setInterval(() => {
      setTimerNow(Date.now());
    }, 16); // ~60fps update rate for smooth display
    return () => clearInterval(displayInterval);
  }, [isFarmersPowerOn]);

  // Helper function to handle timer expiration and reset
  const handleTimerExpiration = useCallback(() => {
    // Don't process expiration if Farmers Power is not active
    if (!isFarmersPowerOn) return;

    // Reset combo and decrease FP once
    if (powerCombo > 1) {
      setPowerCombo(1);
    }

    setCurrentFP((prevFP) => {
      // Find the current stage the user is actually in
      // getCurrentPowerStage returns the next stage index, so we need to subtract 1
      const nextStageIndex = getCurrentPowerStage(prevFP);
      const currentStageIndex = nextStageIndex - 1;

      // Calculate checkpoint: the fpRequired of the current stage
      // The checkpoint is the fpRequired of the highest stage the user has reached
      let checkpoint = 0;
      if (currentStageIndex >= 0) {
        checkpoint = POWER_STAGES[currentStageIndex]?.fpRequired || 0;
      }

      // Use original decay logic
      const fpRequiredForStage = getCurrentPowerStateTarget(prevFP);
      const stage = getCurrentPowerStage(prevFP);
      const multiplier = 0.0015;
      const decayAmount = Math.ceil(
        fpRequiredForStage.target * stage * multiplier
      );

      // Ensure FP doesn't go below the current stage checkpoint
      return Math.max(checkpoint, prevFP - decayAmount);
    });

    // Calculate the proper next window using modulo logic
    const msElapsedSinceLastDonation = lastDonationTime
      ? Date.now() - lastDonationTime.getTime()
      : 0;

    if (lastDonationTime) {
      // Calculate how many full COMBO_WINDOWs have passed since last donation
      const elapsedCycles = Math.floor(
        msElapsedSinceLastDonation / COMBO_WINDOW
      );
      // Calculate the start of the current window (not the next one)
      const currentWindowStart = new Date(
        lastDonationTime.getTime() + elapsedCycles * COMBO_WINDOW
      );
      setLastTimerReset(currentWindowStart);
    } else {
      // If no last donation, just start from now
      setLastTimerReset(new Date());
    }
  }, [
    COMBO_WINDOW,
    isFarmersPowerOn,
    lastDonationTime,
    powerCombo,
    setCurrentFP,
    setLastTimerReset,
    setPowerCombo,
  ]);

  // Separate effect for checking window expiration and handling FP/combo decrease
  useEffect(() => {
    // Don't set up timeout if Farmers Power is not active or no valid lastTimerReset
    if (!isFarmersPowerOn || !lastTimerReset) return;

    const windowExpiryTime = lastTimerReset.getTime() + COMBO_WINDOW;
    const timeToNextExpiry = windowExpiryTime - Date.now();

    // If the time already elapsed, handle it immediately
    if (timeToNextExpiry <= 0) {
      handleTimerExpiration();
      return;
    }

    // Set timeout for the exact moment when the current window expires
    const timeout = setTimeout(handleTimerExpiration, timeToNextExpiry);

    return () => clearTimeout(timeout);
  }, [
    COMBO_WINDOW,
    handleTimerExpiration,
    isFarmersPowerOn,
    lastDonationTime,
    lastTimerReset,
    powerCombo,
    setCurrentFP,
    setLastTimerReset,
    setPowerCombo,
  ]);

  return (
    <div
      className={cn("flex flex-col gap-3 rounded-lg p-3", styles.background)}
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
          <Clock size={16} className={styles.text} />
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
          {/* Calculate remaining time once */}
          {(() => {
            const remainingMs = Math.max(
              0,
              COMBO_WINDOW - (timerNow - lastTimerReset.getTime())
            );
            const minutes = Math.floor(remainingMs / (1000 * 60));
            const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            const centiseconds = Math.floor((remainingMs % 1000) / 10);

            const colonClass = cn("flex items-center", styles.text);

            return (
              <>
                <TimeUnit
                  value={minutes}
                  powerCombo={powerCombo}
                  isFarcasterManiaOn={isFarcasterManiaOn}
                />
                <span className={colonClass}>:</span>
                <TimeUnit
                  value={seconds}
                  powerCombo={powerCombo}
                  isFarcasterManiaOn={isFarcasterManiaOn}
                />
                <span className={colonClass}>:</span>
                <TimeUnit
                  value={centiseconds}
                  powerCombo={powerCombo}
                  isFarcasterManiaOn={isFarcasterManiaOn}
                />
              </>
            );
          })()}
        </motion.div>

        {powerCombo > 1 ? (
          <motion.div
            className={`w-full text-center text-sm font-semibold ${styles.text}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Power Combo: {powerCombo}x
          </motion.div>
        ) : (
          <div className={`w-full text-center text-sm ${styles.text}`}>
            Start a Combo now!
          </div>
        )}
      </div>

      <BurningFuse
        lastTimerReset={lastTimerReset}
        COMBO_WINDOW={COMBO_WINDOW}
        isFarcasterManiaOn={isFarcasterManiaOn}
      />
    </div>
  );
};

const TimeUnit = ({
  value,
  powerCombo,
  isFarcasterManiaOn,
}: {
  value: number;
  powerCombo: number;
  isFarcasterManiaOn: boolean;
}) => {
  const styles = usePowerComboStyles(powerCombo, isFarcasterManiaOn);

  return (
    <div
      className={cn(
        "px-2 py-1 rounded-md text-xs w-full flex items-center justify-center",
        styles.timeUnit
      )}
    >
      {value.toString().padStart(2, "0")}
    </div>
  );
};

const BurningFuse = ({
  lastTimerReset,
  COMBO_WINDOW,
  isFarcasterManiaOn,
}: {
  lastTimerReset: Date;
  COMBO_WINDOW: number;
  isFarcasterManiaOn: boolean;
}) => {
  // Access isFarmersPowerOn from game state
  const { state } = useGame();
  const isFarmersPowerOn = state?.isFarmersPowerOn;

  // Calculate remaining time in the current window
  const now = Date.now();
  const resetTime = lastTimerReset ? lastTimerReset.getTime() : now;
  const timeElapsed = now - resetTime;

  // If Farmers Power is inactive, show full timer
  // Otherwise calculate actual remaining time
  const remainingTime = !isFarmersPowerOn
    ? COMBO_WINDOW
    : Math.max(0, COMBO_WINDOW - timeElapsed);

  // Set percentage based on remaining time (full bar if inactive)
  const remainingPercentage = !isFarmersPowerOn
    ? 98
    : (remainingTime / COMBO_WINDOW) * 98;
  const isExpired = isFarmersPowerOn && remainingTime <= 0;

  return (
    <div className="relative">
      <div className="h-2 bg-[#2A1E12] rounded-full relative">
        <motion.div
          key={`${lastTimerReset ? lastTimerReset.getTime() : "initial"}-${
            isFarmersPowerOn ? "active" : "inactive"
          }`}
          className={`absolute left-0 top-0 h-full ${
            isFarcasterManiaOn
              ? "bg-gradient-to-r from-[#a590e3] via-[#c3b3f3] to-[#e0d6ff]"
              : "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
          }`}
          style={{
            width: `${remainingPercentage}%`,
          }}
          initial={{
            width: `${remainingPercentage}%`,
          }}
          animate={{
            width: !isFarmersPowerOn ? `${remainingPercentage}%` : "2%",
          }}
          transition={{
            duration: isFarmersPowerOn ? remainingTime / 1000 : 0,
            ease: "linear",
          }}
        >
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2">
            <motion.div
              className={`w-4 h-4 rounded-full ${
                isFarcasterManiaOn
                  ? "bg-[#e0d6ff] shadow-lg shadow-[#a590e3]/80"
                  : "bg-yellow-300 shadow-lg shadow-yellow-400/80"
              }`}
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: isFarcasterManiaOn
                  ? [
                      "0 0 10px 2px rgba(165, 144, 227, 0.8)",
                      "0 0 15px 4px rgba(165, 144, 227, 0.9)",
                      "0 0 10px 2px rgba(165, 144, 227, 0.8)",
                    ]
                  : [
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
              isFarcasterManiaOn={isFarcasterManiaOn}
            />
            <SparkParticle
              delay={0.15}
              x={[2, 7]}
              y={[-6, 4]}
              isFarcasterManiaOn={isFarcasterManiaOn}
            />
            <SparkParticle
              delay={0.3}
              x={[-3, 5]}
              y={[-4, 6]}
              isFarcasterManiaOn={isFarcasterManiaOn}
            />
          </div>
        </motion.div>
      </div>

      {isExpired && (
        <motion.div
          className={`absolute inset-0 ${
            isFarcasterManiaOn ? "bg-[#a590e3]" : "bg-yellow-400"
          }`}
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
};

const SparkParticle = ({
  delay,
  x,
  y,
  isFarcasterManiaOn,
}: {
  delay: number;
  x: [number, number];
  y: [number, number];
  isFarcasterManiaOn: boolean;
}) => (
  <motion.div
    className={`absolute top-1/2 right-1/2 w-2.5 h-2.5 rounded-full ${
      isFarcasterManiaOn ? "bg-[#e0d6ff]" : "bg-yellow-300"
    }`}
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
