"use client";

import { useGame } from "../context/GameContext";
import { CropType } from "../types/game";
import { motion } from "framer-motion";

// Import the shared colors
const CROP_COLORS: Record<CropType, string> = {
  wheat: "border-green-400",
  corn: "border-yellow-400",
  tomato: "border-red-400",
  potato: "border-orange-400",
};

const CROPS: { type: CropType; icon: string }[] = [
  { type: "wheat", icon: "🌾" },
  { type: "corn", icon: "🌽" },
  { type: "tomato", icon: "🍅" },
  { type: "potato", icon: "🥔" },
];

export default function Toolbar() {
  const {
    state,
    selectedCrop,
    setSelectedCrop,
    toggleInventory,
  } = useGame();

  // Calculate total items
  const totalSeeds = Object.values(state.seeds).reduce((a, b) => a + b, 0);
  const totalCrops = Object.values(state.crops).reduce((a, b) => a + b, 0);
  const totalItems = totalSeeds + totalCrops;

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[#7E4E31] p-3 flex justify-between items-center">
      <div className="flex gap-2">
        {CROPS.map(({ type, icon }) => (
          <motion.button
            key={type}
            onClick={() => setSelectedCrop(selectedCrop === type ? null : type)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative w-12 h-12 rounded-lg flex items-center justify-center
              ${selectedCrop === type ? "bg-[#6d4c2c]" : "bg-[#8B5E3C]"}
              border-2 ${CROP_COLORS[type]}
              hover:bg-[#6d4c2c] transition-colors
            `}
          >
            <span className="text-xl">{icon}</span>
            <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full w-5 h-5 flex items-center justify-center text-xs text-white/90">
              {state.seeds[type]}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={toggleInventory}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <span className="text-xl">📦</span>
        <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full px-1.5 py-0.5 text-xs text-white/90">
          {totalItems}/{state.inventoryCapacity}
        </div>
      </motion.button>
    </div>
  );
}
