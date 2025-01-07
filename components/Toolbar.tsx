"use client";

import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";

export default function Toolbar({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, setShowInventory, setShowSeedsMenu } = useGame();

  return (
    <div
      className="fixed bottom-0 inset-x-0 bg-[#7E4E31] p-3 flex justify-between items-center"
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
      data-tutorial="toolbar"
    >
      <motion.button
        onClick={() => setShowSeedsMenu(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <span className="text-xl">🌱</span>
      </motion.button>

      <motion.div
        className="bg-[#8B5E3C] h-[42px] px-3 rounded-xl shadow-lg border-2 border-[#6d4c2c] flex items-center"
        whileHover={{ scale: 1.02 }}
        animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
      >
        <span className="text-white/90 font-bold text-sm tracking-wide">
          <span className="text-lg mb-1 mr-1">🪙</span>
          {state.coins}
        </span>
      </motion.div>

      <motion.button
        onClick={() => setShowInventory(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <span className="text-xl">📦</span>
      </motion.button>
    </div>
  );
}
