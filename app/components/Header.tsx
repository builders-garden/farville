"use client";

import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { state, toggleMarketplace } = useGame();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevel = useRef(state.level);

  useEffect(() => {
    if (state.level > prevLevel.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }
    prevLevel.current = state.level;
  }, [state.level]);

  const currentLevelXp = state.experience - (state.level - 1) * 100;
  const progress = (currentLevelXp / 100) * 100;

  return (
    <div className="bg-[var(--wood)] px-3 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c] z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="relative">
          <div className="bg-[#7E4E31] px-3 py-1.5 rounded-xl shadow-lg border-2 border-[#6d4c2c] flex items-center gap-3">
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
            <span className="text-xs text-white/70 tracking-wide">
              {currentLevelXp}/100
            </span>
          </div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={
              state.level > 1 ? { scale: [1, 1.5, 0], opacity: [0, 1, 0] } : {}
            }
            className="absolute -top-2 -right-2 text-yellow-300 text-xl"
          >
            ⭐
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="bg-[#8B5E3C] px-3 py-1.5 rounded-xl shadow-lg border-2 border-[#6d4c2c]"
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
            className="bg-[#8B5E3C] px-3 py-1.5 text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-sm font-medium tracking-wide"
          >
            🏪 Market
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            className="absolute top-full left-1/2 -translate-x-1/2 bg-[#FFB938] text-[#7E4E31] px-3 py-1.5 rounded-lg shadow-lg font-bold"
          >
            Level Up! 🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
