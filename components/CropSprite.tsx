"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CropType } from "../types/game";
import { formatDistanceStrict } from "date-fns";
import { useGame } from "../context/GameContext";
import { GROWTH_TIMES } from "../lib/game-constants";

interface CropSpriteProps {
  crop: {
    type: CropType;
    plantedAt: number;
    readyToHarvest: boolean;
  };
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
  const getGrowthProgress = () => {
    const { plantedAt } = crop;
    const growthTime = GROWTH_TIMES[crop.type];
    const elapsed = Date.now() - plantedAt;
    return Math.min(elapsed / growthTime, 1);
  };

  const getTimeRemaining = () => {
    const { plantedAt } = crop;
    const growthTime = GROWTH_TIMES[crop.type];
    const elapsed = Date.now() - plantedAt;
    const remaining = Math.max(growthTime - elapsed, 0);

    return formatDistanceStrict(0, remaining, {
      unit: remaining > 3600000 ? "hour" : "minute",
    });
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

      {/* Progress Bar - Centered and smaller */}
      {!crop.readyToHarvest && (
        <div className="absolute bottom-[3%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-3/4">
          {!isDemo && state.gridSize.width < 5 && (
            <div className="text-[10px] text-white font-medium mb-1 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
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
          className="w-full h-full mb-2"
          style={{
            backgroundImage: `url('/images/crop/${crop.type}.png')`,
            backgroundSize: `${
              crop.readyToHarvest
                ? "30"
                : Math.min(getGrowthProgress() * 30, 30)
            }%`,
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
  crop?: {
    type: CropType;
    plantedAt: number;
    readyToHarvest: boolean;
  };
  isDemo?: boolean;
}) {
  return crop ? (
    <PlantedCropSprite crop={crop} isDemo={isDemo} />
  ) : (
    <EmptyCropSprite />
  );
}
