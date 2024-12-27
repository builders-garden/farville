"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";

export default function FertilizerIndicator() {
  const { selectedFertilizer, setSelectedFertilizer } = useGame();

  if (!selectedFertilizer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 flex items-center gap-2"
    >
      <motion.div
        className="bg-[#7E4E31] px-4 py-2 rounded-lg shadow-lg border-2 border-[#8B5E3C] flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-xl">{selectedFertilizer.icon}</span>
        <span className="text-white/90">Click on a growing crop to apply</span>
      </motion.div>
      <motion.button
        onClick={() => setSelectedFertilizer(null)}
        className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
