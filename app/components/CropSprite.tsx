"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crop, CropType } from "../types/game";
import { formatDistanceStrict } from "date-fns";

interface CropSpriteProps {
  crop: Crop;
}

const CROP_COLORS: Record<CropType, string> = {
  wheat: "border-green-400",
  corn: "border-yellow-400",
  tomato: "border-red-400",
  potato: "border-orange-400",
};

const SEED_EMOJIS: Record<CropType, string> = {
  wheat: "🌾",
  corn: "🌽",
  tomato: "🍅",
  potato: "🥔",
};

export default function CropSprite({ crop }: CropSpriteProps) {
  const getCropEmoji = () => {
    const { type, growthStage, readyToHarvest } = crop;

    if (readyToHarvest) {
      return {
        wheat: "🌾",
        corn: "🌽",
        tomato: "🍅",
        potato: "🥔",
      }[type];
    }

    // Growth stages (0-3)
    return ["🌱", "🌿", "🎋", "🪴"][growthStage];
  };

  const getGrowthProgress = () => {
    const { type, plantedAt } = crop;
    const growthTimes = {
      wheat: 1800000,
      corn: 3600000,
      tomato: 7200000,
      potato: 21600000,
    };

    const baseGrowthTime = growthTimes[type];
    const elapsed = Date.now() - plantedAt;
    return Math.min(elapsed / baseGrowthTime, 1);
  };

  const getTimeRemaining = () => {
    const { type, plantedAt } = crop;
    const growthTimes = {
      wheat: 1800000,
      corn: 3600000,
      tomato: 7200000,
      potato: 21600000,
    };

    const baseGrowthTime = growthTimes[type];
    const elapsed = Date.now() - plantedAt;
    const remaining = Math.max(baseGrowthTime - elapsed, 0);

    return formatDistanceStrict(0, remaining, {
      unit: remaining > 3600000 ? "hour" : "minute",
    });
  };

  return (
    <>
      {/* Colored Border Container */}
      <div
        className={`absolute inset-0 border-2 rounded-lg ${
          CROP_COLORS[crop.type]
        } bg-opacity-20`}
      />

      {/* Growth Progress Bar */}
      {!crop.readyToHarvest && (
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-200/50 rounded-b-lg overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${getGrowthProgress() * 100}%` }}
            className="h-full bg-green-500"
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* Seed Planting Animation */}
      <AnimatePresence>
        {crop.growthStage === 0 && (
          <motion.div
            initial={{ scale: 1.5, opacity: 1, y: -20 }}
            animate={{ scale: 0, opacity: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute text-lg pointer-events-none"
          >
            {SEED_EMOJIS[crop.type]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Emoji with Animations */}
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
        {getCropEmoji()}
        {!crop.readyToHarvest && (
          <div className="text-[10px] text-white font-medium mt-1 text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {getTimeRemaining()}
          </div>
        )}
        {crop.readyToHarvest && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full p-1"
          >
            ✨
          </motion.div>
        )}
      </motion.div>

      {/* Harvest Ready Animation */}
      <AnimatePresence>
        {crop.readyToHarvest && (
          <motion.div
            className="absolute inset-0 bg-yellow-400/20 rounded-lg"
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
