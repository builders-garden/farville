"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";

export default function PerkIndicator() {
  const { selectedPerk, setSelectedPerk } = useGame();

  if (!selectedPerk) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-24 right-4 flex items-center gap-2 mx-2 z-50"
    >
      <motion.div
        className="bg-[#7E4E31] px-4 py-2 rounded-lg shadow-lg border-2 border-[#8B5E3C] flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
      >
        <img
          src={`/images${selectedPerk.item.icon}`}
          alt="perk-icon"
          className="w-6 h-6"
        />
        <span className="text-white/90 text-[10px]">
          Click on a growing crop to apply {selectedPerk.item.name}
        </span>
      </motion.div>
      <motion.button
        onClick={() => setSelectedPerk(null)}
        className="py-2 px-4 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-red-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}
