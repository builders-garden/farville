"use client";

import { MODE_DEFINITIONS, ModeFeature } from "@/lib/modes/constants";
import { motion } from "framer-motion";
import Image from "next/image";
import { useNextStep } from "nextstepjs";
import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

export default function Toolbar({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const {
    // setShowInventory,
    setShowMarket,
    setShowHelp,
    setShowProfile,
    setShowLeaderboard,
    setShowQuests,
    setShowClans,
    mode,
    state,
    newGoldCropsFound,
  } = useGame();

  const { currentTour, currentStep, closeNextStep } = useNextStep();

  const [modeDefinition, setModeDefinition] = useState(MODE_DEFINITIONS[mode]);
  useEffect(() => {
    setModeDefinition(MODE_DEFINITIONS[mode]);
  }, [mode]);

  return (
    <div className="fixed bottom-0 inset-x-0 bg-[#7E4E31] max-w-md mx-auto">
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
        {/* Market button */}
        <div
          className="flex flex-col items-center w-[48px]"
          id="market-toolbar-btn"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (currentTour === "mainTour" && currentStep === 5) {
                closeNextStep();
              }
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

        {/* Quests button */}
        {modeDefinition.features.includes(ModeFeature.Quests) && (
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
        )}

        {/* Ranking button */}
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
              {modeDefinition.features.includes(ModeFeature.Leagues) ? (
                <Image
                  src={`/images/leagues/${state.weeklyStats.league || 1}.png`}
                  alt="League"
                  fill
                  sizes="48"
                />
              ) : (
                <Image
                  src="/images/icons/experience.png"
                  alt="Ranking"
                  fill
                  sizes="48"
                />
              )}
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Ranking
          </span>
        </div>

        {/* Clans Button */}
        <div
          className="flex flex-col items-center w-[48px]"
          id="market-toolbar-btn"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowClans(true);
            }}
            data-tutorial="marketplace"
            className="w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-10 xs:h-10">
              {state.clan?.clan.imageUrl ? (
                <Image
                  src={state.clan.clan.imageUrl}
                  alt="Clan Icon"
                  fill
                  sizes="48"
                  className="rounded-md object-cover"
                />
              ) : (
                // Fallback icon if no clan image is set
                <Image
                  src="/images/icons/clans.png"
                  alt="Feuds and Clans Icon"
                  fill
                  sizes="48"
                  className="rounded-md"
                />
              )}
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">
            Feuds
          </span>
        </div>

        <div className="flex flex-col items-center w-[48px]">
          <motion.button
            onClick={() => {
              setShowHelp(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 xs:w-12 xs:h-12 rounded-lg flex items-center justify-center bg-[#8B5E3C] hover:bg-[#6d4c2c] transition-colors"
          >
            <div className="relative w-6 h-6 xs:w-8 xs:h-8">
              <Image
                src="/images/icons/help.png"
                alt="Help"
                fill
                sizes="48"
              />
            </div>
          </motion.button>
          <span className="text-[4px] xs:text-[6px] text-white mt-1">Help</span>
        </div>

        {modeDefinition.features.includes(ModeFeature.HarvestHonours) && (
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
                      ? "rounded-md w-[36px] h-[36px] object-cover"
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
        )}
      </div>
    </div>
  );
}
