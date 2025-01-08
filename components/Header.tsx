"use client";

import { LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import { getCurrentLevelAndProgress } from "@/lib/utils";

export default function Header() {
  const {
    state,
    setShowMarket,
    setShowSettings,
    setShowLeaderboard,
    setShowQuests,
  } = useGame();
  const { progress } = getCurrentLevelAndProgress(state.experience);

  return (
    <div className="bg-[var(--wood)] px-3 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c] z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="relative">
          <div className="bg-[#7E4E31] h-[42px] px-4 rounded-xl shadow-lg border-2 border-[#6d4c2c] flex items-center">
            <div className="w-fit">
              <div className="flex items-center justify-between gap-1">
                <span className="text-white/90 font-semibold tracking-wide text-xs flex items-center gap-1">
                  <span className="text-[#FFB938] mb-1">⭐</span> {state.level}
                </span>
                <span className="text-white/70 text-[10px]">
                  ({state.experience.toLocaleString()}/
                  {LEVEL_XP_THRESHOLDS[
                    Math.min(
                      LEVEL_XP_THRESHOLDS.findIndex(
                        (threshold) => state.experience < threshold
                      ),
                      LEVEL_XP_THRESHOLDS.length - 1
                    )
                  ].toLocaleString()}
                  )
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-[#5d3c1c] rounded-full overflow-hidden">
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMarket(true)}
            data-tutorial="marketplace"
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-lg font-medium"
          >
            🏪
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQuests(true)}
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-lg font-medium"
          >
            📜
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLeaderboard(true)}
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-lg font-medium"
          >
            🏆
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSettings(true)}
            className="bg-[#8B5E3C] h-[42px] w-[42px] flex items-center justify-center text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                     shadow-lg border-2 border-[#6d4c2c] text-lg font-medium"
          >
            ⚙️
          </motion.button>
        </div>
      </div>
    </div>
  );
}
