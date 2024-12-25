"use client";

import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Header() {
  const { state, toggleMarketplace, toggleSettings } = useGame();

  const progress = ((state.experience - (state.level - 1) * 100) / 100) * 100;

  return (
    <div className="bg-[var(--wood)] px-3 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c] z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="relative">
          <div className="bg-[#7E4E31] h-[42px] px-3 rounded-xl shadow-lg border-2 border-[#6d4c2c] flex items-center gap-3">
            <div>
              <span className="text-white/90 font-bold tracking-wide text-sm">
                ⭐ Level {state.level}
              </span>
              <div className="mt-1 h-1.5 w-24 bg-[#6d4c2c] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FFB938]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="bg-[#8B5E3C] h-[42px] px-3 rounded-xl shadow-lg border-2 border-[#6d4c2c] flex items-center"
            whileHover={{ scale: 1.02 }}
            animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
          >
            <span className="text-white/90 font-bold text-sm tracking-wide">
              🪙 {state.coins}
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleMarketplace}
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-sm font-medium"
          >
            🏪
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleSettings}
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-sm font-medium"
          >
            ⚙️
          </motion.button>
        </div>
      </div>
    </div>
  );
}
