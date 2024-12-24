"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crop } from "../types/game";

interface CropSpriteProps {
  crop: Crop;
}

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
      wheat: 30000,
      corn: 45000,
      tomato: 60000,
      potato: 90000,
    };

    const baseGrowthTime = growthTimes[type];
    const elapsed = Date.now() - plantedAt;
    return Math.min(elapsed / baseGrowthTime, 1);
  };

  return (
    <>
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
        className="absolute inset-0 flex items-center justify-center text-2xl"
      >
        {getCropEmoji()}
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
