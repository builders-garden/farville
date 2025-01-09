"use client";

import { useGame } from "../context/GameContext";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Toolbar({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const {
    setShowInventory,
    setShowMarket,
    setShowSettings,
    setShowLeaderboard,
    setShowQuests,
  } = useGame();

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
      {/* <motion.button
        onClick={() => setShowSeedsMenu(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <span className="text-xl">🌱</span>
      </motion.button> */}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowMarket(true)}
        data-tutorial="marketplace"
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <Image
          src="/images/icons/market.png"
          alt="Marketplace"
          width={24}
          height={24}
        />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowQuests(true)}
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <Image
          src="/images/icons/quests.png"
          alt="Quests"
          width={24}
          height={24}
        />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowLeaderboard(true)}
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <Image
          src="/images/icons/experience.png"
          alt="Leaderboard"
          width={24}
          height={24}
        />
      </motion.button>

      <motion.button
        onClick={() => setShowInventory(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <Image
          src="/images/icons/inventory.png"
          alt="Inventory"
          width={24}
          height={24}
        />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowSettings(true)}
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
      >
        <Image
          src="/images/icons/settings.png"
          alt="Settings"
          width={24}
          height={24}
        />
      </motion.button>
    </div>
  );
}
