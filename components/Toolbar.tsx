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
    setShowProfile,
    setShowLeaderboard,
    setShowQuests,
    state,
    newGoldCropsFound,
  } = useGame();

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[#7E4E31]">
      <div
        className="py-3 flex justify-evenly items-center"
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        data-tutorial="toolbar"
      >
        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowMarket(true);
            }}
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
          <span className="text-[6px] text-white mt-1">Market</span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowQuests(true);
            }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative
              ${
                state.claimableQuests
                  ? "bg-[#A17449] shadow-lg shadow-[#A17449]/50 animate-pulse"
                  : "bg-[#8B5E3C] hover:bg-[#6d4c2c]"
              }`}
          >
            {state.claimableQuests && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full" />
            )}
            <Image
              src="/images/icons/quests.png"
              alt="Quests"
              width={24}
              height={24}
            />
          </motion.button>
          <span
            className={`text-[6px] mt-1 ${
              state.claimableQuests
                ? "text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"
                : "text-white"
            }`}
          >
            Quests
          </span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowLeaderboard(true);
            }}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <Image
              src="/images/icons/experience.png"
              alt="Leaderboard"
              width={24}
              height={24}
            />
          </motion.button>
          <span className="text-[6px] text-white mt-1">Ranking</span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            onClick={() => {
              setShowInventory(true);
            }}
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
          <span className="text-[6px] text-white mt-1">Inventory</span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowSettings(true);
            }}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <Image
              src="/images/icons/settings.png"
              alt="Settings"
              width={24}
              height={24}
            />
          </motion.button>
          <span className="text-[6px] text-white mt-1">Settings</span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowProfile(true);
            }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors relative
              ${
                newGoldCropsFound.length > 0
                  ? "bg-[#A17449] shadow-lg shadow-[#A17449]/50 animate-pulse"
                  : "bg-[#8B5E3C] hover:bg-[#6d4c2c]"
              }`}
            disabled={!state.user}
          >
            {newGoldCropsFound.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full" />
            )}
            <Image
              src={state.user?.avatarUrl || "/images/icons/farmer.png"}
              alt="Profile"
              width={36}
              height={36}
              className={state.user?.avatarUrl ? "rounded-full" : "rounded-md"}
            />
          </motion.button>
          <span
            className={`text-[6px] mt-1 ${
              newGoldCropsFound.length > 0
                ? "text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"
                : "text-white"
            }`}
          >
            Profile
          </span>
        </div>
      </div>
    </div>
  );
}
