"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CropType } from "../lib/types/game";
import { useGame } from "../context/GameContext";
import { useEffect, useState } from "react";
import { formatTime } from "@/lib/utils";
import clsx from "clsx";
import { SPEED_BOOST } from "@/lib/game-constants";

interface CropSpriteCropProp {
  type: CropType;
  plantedAt: number;
  readyToHarvest: boolean;
  harvestAt?: number;
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

  const getSpeedBoostColor = (cropType: CropType, opacity: number = 0.7) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, boost] of Object.entries(SPEED_BOOST)) {
      if (boost.applyTo.includes(cropType)) {
        return opacity !== undefined
          ? `${boost.color}${Math.round(opacity * 100)}`
          : boost.color;
      }
    }
    return `rgba(31, 150, 243, ${opacity})`; // Default color
  };

  useEffect(() => {
    if (isDemo || crop.readyToHarvest || !crop.harvestAt) return;

    // Initial update
    setForceUpdate((prev) => prev + 1);

    const interval = setInterval(() => {
      if (Date.now() >= crop.harvestAt!) {
        clearInterval(interval);
        return;
      }
      setForceUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemo, crop]);

  const getGrowthProgress = () => {
    if (!crop.harvestAt) return 0;
    const totalTime = crop.harvestAt - crop.plantedAt;
    const elapsed = Date.now() - crop.plantedAt;
    return Math.min(elapsed / totalTime, 1);
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
    if (!crop.harvestAt) return "...";

    const remainingTime = Math.max(crop.harvestAt - Date.now(), 0);
    const formattedRemainingTime = formatTime(remainingTime / 1000);
    const parts = formattedRemainingTime.split(" ");
    return parts.slice(0, 2).join(" ");
  };

  const isGridSmall = state.gridSize.width < 4;

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
          className={clsx("absolute inset-[5%]", isGridSmall ? "mb-2" : "mb-1")}
          style={{
            backgroundImage: "url('/images/land/soil_big.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            imageRendering: "pixelated",
          }}
        />
      )}

      {/* Speed Boost Glow Effect */}
      {crop.speedBoostedAt &&
        Date.now() - crop.speedBoostedAt < 1000 * 60 * 60 * 2 && (
          <div
            className="absolute inset-0 rounded-sm z-10"
            style={{
              boxShadow: `0 0 20px 8px ${getSpeedBoostColor(
                crop.type,
                0.8
              )} inset`,
              background: `radial-gradient(circle, ${getSpeedBoostColor(
                crop.type,
                0.3
              )} 0%, transparent 70%)`,
            }}
            title={`${crop.speedBoost}x Speed Boost`}
          />
        )}

      {/* Progress Bar - Centered and smaller */}
      {!crop.readyToHarvest && (
        <div className="absolute bottom-[3%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-3/4 z-50">
          {!isDemo && (
            <div
              className={clsx(
                "text-white font-medium mb-1 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]",
                isGridSmall ? "text-[7px]" : "text-[6px]"
              )}
            >
              {getTimeRemaining()}
            </div>
          )}
          <div
            className={clsx("w-full bg-black/50", isGridSmall ? "h-2" : "h-1")}
          >
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
