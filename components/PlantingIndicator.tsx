"use client";

import { motion } from "motion/react";
import { useGame } from "../context/GameContext";

export default function PlantingIndicator() {
  const { selectedSeed, setSelectedSeed, state } = useGame();

  if (!selectedSeed) return null;

  const seedItem = state.items.find((item) => item.slug === selectedSeed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 flex items-center gap-2 mx-2 z-40"
    >
      <motion.div
        className="bg-[#7E4E31] px-4 py-2 rounded-lg shadow-lg border-2 border-[#8B5E3C] flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
      >
        <motion.img
          src={`/images${seedItem?.icon}`}
          alt={seedItem?.name}
          className="w-6 h-6 object-contain"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-white/90 text-[10px]">
          Planting {seedItem?.name.replace(" Seeds", "")}
        </span>
      </motion.div>
      <motion.button
        onClick={() => setSelectedSeed(null)}
        className="py-2 px-4 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-red-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
