import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

interface PowerTimerProps {
  powerCombo: number;
  lastDonationTime: Date | null;
  COMBO_WINDOW: number;
  setPowerCombo: React.Dispatch<React.SetStateAction<number>>;
  setCurrentFP: React.Dispatch<React.SetStateAction<number>>;
  lastTimerReset: Date;
  setLastTimerReset: React.Dispatch<React.SetStateAction<Date>>;
}

// Helper function to get conditional styling based on power combo
const usePowerComboStyles = (powerCombo: number) => {
  return useMemo(
    () => ({
      text: powerCombo > 1 ? "text-yellow-400" : "text-[#FFB938]",
      background:
        powerCombo > 1
          ? "bg-gradient-to-br from-[#4A341A] via-[#5A442A] to-[#4A341A] relative overflow-hidden"
          : "bg-[#4A341A]",
      timeUnit:
        powerCombo > 1
          ? "bg-[#5C4121]/80 border border-yellow-400/20"
          : "bg-[#5C4121]",
    }),
    [powerCombo]
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
}: PowerTimerProps) => {
  const [timerNow, setTimerNow] = useState(Date.now());
  const styles = usePowerComboStyles(powerCombo);

  // Effect for updating timer display
  useEffect(() => {
    const displayInterval = setInterval(() => {
      setTimerNow(Date.now());
    }, 16); // ~60fps update rate for smooth display
    return () => clearInterval(displayInterval);
  }, []);

  // Helper function to handle timer expiration and reset
  const handleTimerExpiration = useCallback(() => {
    // Reset combo and decrease FP once
    if (powerCombo > 1) {
      setPowerCombo(1);
    }
    setCurrentFP((prevFP) => Math.max(0, prevFP - 1));

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
    lastDonationTime,
    powerCombo,
    setCurrentFP,
    setLastTimerReset,
    setPowerCombo,
  ]);

  // Separate effect for checking window expiration and handling FP/combo decrease
  useEffect(() => {
    // Only set up the interval if we have a valid lastTimerReset
    if (!lastTimerReset) return;

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
          <Clock
            size={16}
            className={styles.text}
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
                />
                <span className={colonClass}>:</span>
                <TimeUnit
                  value={seconds}
                  powerCombo={powerCombo}
                />
                <span className={colonClass}>:</span>
                <TimeUnit
                  value={centiseconds}
                  powerCombo={powerCombo}
                />
              </>
            );
          })()}
        </motion.div>

        {powerCombo > 1 && (
          <motion.div
            className={`w-full text-center text-sm font-semibold ${styles.text}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Power Combo: {powerCombo}x
          </motion.div>
        )}
      </div>

      <BurningFuse
        lastTimerReset={lastTimerReset}
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
}) => {
  const styles = usePowerComboStyles(powerCombo);

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
}: {
  lastTimerReset: Date;
  COMBO_WINDOW: number;
}) => {
  // Calculate remaining time in the current window
  const timeElapsed = Date.now() - lastTimerReset.getTime();
  const remainingTime = Math.max(0, COMBO_WINDOW - timeElapsed);
  const remainingPercentage = (remainingTime / COMBO_WINDOW) * 98;
  const isExpired = remainingTime <= 0;

  return (
    <div className="relative">
      <div className="h-2 bg-[#2A1E12] rounded-full relative">
        <motion.div
          key={lastTimerReset ? lastTimerReset.getTime() : "initial"}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"
          style={{
            width: `${remainingPercentage}%`,
          }}
          animate={{
            width: "2%",
          }}
          transition={{
            duration: remainingTime / 1000,
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

      {isExpired && (
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
};

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
