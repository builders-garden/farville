"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CropType } from "../types/game";
import { formatDistanceStrict } from "date-fns";
import { useGame } from "../context/GameContext";
import { useEffect, useState } from "react";
import { CROP_DATA } from "@/lib/game-constants";

interface CropSpriteCropProp {
  type: CropType;
  plantedAt: number;
  readyToHarvest: boolean;
  speedBoost?: number;
  speedBoostedAt?: number;
  yieldBoost?: number;
}
interface CropSpriteProps {
  crop: CropSpriteCropProp;
  isDemo?: boolean;
}

export function EmptyCropSprite() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: "url('/images/land/land_big.png')",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        imageRendering: "pixelated",
      }}
    />
  );
}

export function PlantedCropSprite({ crop, isDemo }: CropSpriteProps) {
  const { state } = useGame();
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (isDemo || crop.readyToHarvest) return;

    // Initial update
    setForceUpdate((prev) => prev + 1);

    const interval = setInterval(() => {
      const { plantedAt } = crop;
      const growthTime = CROP_DATA[crop.type].growthTime;

      // If no speed boost, calculate normal progress
      if (!crop.speedBoost || !crop.speedBoostedAt) {
        const progress = (Date.now() - plantedAt) / growthTime;
        if (progress >= 1) {
          clearInterval(interval);
          return;
        }
        setForceUpdate((prev) => prev + 1);
        return;
      }

      // Calculate time elapsed before and after speed boost
      const timeBeforeBoost = Math.max(0, crop.speedBoostedAt - plantedAt);
      const timeAfterBoost = Math.max(0, Date.now() - crop.speedBoostedAt);

      // Calculate effective progress with speed boost
      const effectiveTime = timeBeforeBoost + timeAfterBoost * crop.speedBoost;
      const progress = effectiveTime / growthTime;

      if (progress >= 1) {
        clearInterval(interval);
        return;
      }
      setForceUpdate((prev) => prev + 1);
    }, 1000); // Update more frequently for smoother progress

    return () => clearInterval(interval);
  }, [isDemo, crop]);

  const getGrowthProgress = () => {
    const { plantedAt } = crop;
    const growthTime = CROP_DATA[crop.type].growthTime;

    // If no speed boost, calculate normal progress
    if (!crop.speedBoost || !crop.speedBoostedAt) {
      return Math.min((Date.now() - plantedAt) / growthTime, 1);
    }

    // Calculate time elapsed before and after speed boost
    const timeBeforeBoost = Math.max(0, crop.speedBoostedAt - plantedAt);
    const timeAfterBoost = Math.max(0, Date.now() - crop.speedBoostedAt);

    // Apply speed boost only to time after the boost was applied
    const effectiveTime = timeBeforeBoost + timeAfterBoost * crop.speedBoost;

    return Math.min(effectiveTime / growthTime, 1);
  };

  const getGrowthStage = () => {
    const progress = getGrowthProgress();
    if (crop.readyToHarvest) return 6;
    if (progress >= 0.8) return 5;
    if (progress >= 0.6) return 4;
    if (progress >= 0.4) return 3;
    if (progress >= 0.2) return 2;
    return 1;
  };

  const getTimeRemaining = () => {
    const { plantedAt } = crop;
    const growthTime = CROP_DATA[crop.type].growthTime;

    // If no speed boost, calculate normal remaining time
    if (!crop.speedBoost || !crop.speedBoostedAt) {
      const remainingTime = Math.max(growthTime - (Date.now() - plantedAt), 0);
      if (remainingTime > 3600000) {
        const hours = Math.floor(remainingTime / 3600000);
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
      }
      return formatDistanceStrict(0, remainingTime, { unit: "minute" });
    }

    // Calculate time elapsed before and after speed boost
    const timeBeforeBoost = Math.max(0, crop.speedBoostedAt - plantedAt);
    const timeAfterBoost = Math.max(0, Date.now() - crop.speedBoostedAt);

    // Calculate remaining time in effective growth time
    const effectiveTimeElapsed =
      timeBeforeBoost + timeAfterBoost * crop.speedBoost;
    const remainingEffectiveTime = Math.max(
      growthTime - effectiveTimeElapsed,
      0
    );

    // Convert to real time (divide by speed boost since boosted time passes faster)
    const remainingRealTime = remainingEffectiveTime / crop.speedBoost;

    if (remainingRealTime > 3600000) {
      // If more than 1 hour
      const hours = Math.floor(remainingRealTime / 3600000);
      const minutes = Math.floor((remainingRealTime % 3600000) / 60000);
      return `${hours}h ${minutes}m`;
    }

    return formatDistanceStrict(0, remainingRealTime, { unit: "minute" });
  };

  return (
    <>
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/land/land_big.png')",
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      {crop.plantedAt && (
        <div
          className="absolute inset-[5%] mb-2"
          style={{
            backgroundImage: "url('/images/land/soil_big.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            imageRendering: "pixelated",
          }}
        />
      )}

      {/* Speed Boost Indicator */}
      {crop.speedBoost &&
        crop.speedBoost > 1 &&
        crop.speedBoostedAt &&
        Date.now() - crop.speedBoostedAt < 1000 * 60 * 60 * 2 && (
          <div className="absolute top-1 right-1 z-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-blue-500/80 rounded-full px-1"
              title={`${crop.speedBoost}x Speed Boost`}
            >
              ⚡️
            </motion.div>
          </div>
        )}

      {/* Progress Bar - Centered and smaller */}
      {!crop.readyToHarvest && (
        <div className="absolute bottom-[3%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-3/4 z-50">
          {!isDemo && state.gridSize.width < 5 && (
            <div className="text-[8px] text-white font-medium mb-1 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {getTimeRemaining()}
            </div>
          )}
          <div className="w-full h-2 bg-black/50">
            <motion.div
              className="h-full bg-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${getGrowthProgress() * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {/* Crop Image/Emoji with Animations */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          rotate: crop.readyToHarvest ? [0, -5, 5, -5, 5, 0] : 0,
        }}
        exit={{ scale: 0, y: -20 }}
        transition={{
          duration: 0.3,
          rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
        }}
        className="crop-sprite absolute inset-0 flex flex-col items-center justify-center"
      >
        <div
          className="w-full h-full mb-6"
          style={{
            backgroundImage: `url('/images/growing-crop/${
              crop.type
            }-${getGrowthStage()}.png')`,
            backgroundSize: "40%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />
      </motion.div>

      {/* Harvest Ready Animation */}
      <AnimatePresence>
        {crop.readyToHarvest && (
          <motion.div
            className="absolute inset-0 bg-yellow-400/20 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function CropSprite({
  crop,
  isDemo,
}: {
  crop?: CropSpriteCropProp;
  isDemo?: boolean;
}) {
  return crop ? (
    <PlantedCropSprite crop={crop} isDemo={isDemo} />
  ) : (
    <EmptyCropSprite />
  );
}
