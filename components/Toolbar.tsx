"use client";

import { useGame } from "../context/GameContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mode } from "@/lib/types/game";

export default function Toolbar({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const {
    // setShowInventory,
    setShowMarket,
    setShowSettings,
    setShowProfile,
    setShowLeaderboard,
    setShowQuests,
    setMode,
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
        <div
          className="flex flex-col items-center w-[48px]"
          id="market-toolbar-btn"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowMarket(true);
            }}
            data-tutorial="marketplace"
            className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/market.png"
                alt="Marketplace"
                fill
                sizes="48"
                className="object-contain"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Market
          </span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowQuests(true);
            }}
            className={`w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center transition-colors relative
              ${
                state.claimableQuests
                  ? "bg-[#A17449] shadow-lg shadow-[#A17449]/50 animate-pulse"
                  : "bg-[#8B5E3C] hover:bg-[#6d4c2c]"
              }`}
          >
            {state.claimableQuests && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full" />
            )}
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/quests.png"
                alt="Quests"
                fill
                sizes="48"
              />
            </div>
          </motion.button>
          <span
            className={`text-[4px] xs:text-[6px] mt-1 ${
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
            className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-7 xs:w-7 xs:h-9">
              <Image
                src={`/images/leagues/${state.weeklyStats.league || 1}.png`}
                alt="League"
                fill
                sizes="48"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Ranking
          </span>
        </div>

        {/* <div className="flex flex-col items-center w-[48px]">
          <motion.button
            onClick={() => {
              setShowInventory(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/inventory.png"
                alt="Inventory"
                fill
                sizes="48"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Inventory
          </span>
        </div> */}

        <div
          className="flex flex-col items-center w-[48px]"
          id="market-toolbar-btn"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMode((prev) =>
                prev === Mode.Classic ? Mode.Farcon : Mode.Classic
              );
            }}
            data-tutorial="marketplace"
            className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/market.png"
                alt="Marketplace"
                fill
                sizes="48"
                className="object-contain"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">Mode</span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowSettings(true);
            }}
            className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/settings.png"
                alt="Settings"
                fill
                sizes="48"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Settings
          </span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowProfile(true);
            }}
            className={`w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center transition-colors relative
              ${
                newGoldCropsFound.length > 0
                  ? "bg-[#A17449] shadow-lg shadow-[#A17449]/50 animate-pulse"
                  : "bg-[#8B5E3C] hover:bg-[#6d4c2c]"
              }`}
            disabled={!state.user?.avatarUrl}
          >
            {newGoldCropsFound.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full" />
            )}
            <div className="relative w-6 h-6 xs:w-10 xs:h-10">
              <Image
                src={
                  state.user?.selectedAvatarUrl ||
                  state.user?.avatarUrl ||
                  "/images/icons/farmer.png"
                }
                alt="Profile"
                fill
                sizes="48"
                className={
                  state.user?.selectedAvatarUrl || state.user?.avatarUrl
                    ? "rounded-full w-[36px] h-[36px] object-cover"
                    : "rounded-md"
                }
              />
            </div>
          </motion.button>
          <span
            className={`text-[4px] xs:text-[6px] mt-1 ${
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
