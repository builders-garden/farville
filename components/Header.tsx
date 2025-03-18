"use client";

import { LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import Image from "next/image";
import { OG_FIDS_LIST } from "@/lib/contracts/constants";

export default function Header() {
  const { state, setShowTimeline, setShowStreaks, setShowMintOGBadge } =
    useGame();
  const { progress } = getCurrentLevelAndProgress(state.experience);

  const showOgButton = OG_FIDS_LIST.indexOf(state.user.fid) !== -1;

  return (
    <div className="bg-[#8B5E3C]/40 px-4 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c]/50 z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div
          className="h-[42px] rounded-xl flex items-center cursor-pointer"
          onClick={() => setShowTimeline(true)}
        >
          <div className="w-fit">
            <div className="flex items-center justify-between gap-1">
              <span className="text-white/90 font-semibold tracking-wide text-xs flex items-center gap-1">
                <Image
                  src="/images/icons/experience.png"
                  alt="Level"
                  width={16}
                  height={16}
                />
                {state.level}
              </span>
              <span className="text-white/70 text-[8px]">
                (
                {(state.experience >= 1000000
                  ? (state.experience / 1000000).toFixed(1) + "M"
                  : state.experience >= 1000
                  ? (state.experience / 1000).toFixed(1) + "K"
                  : state.experience.toString()
                ).replace(/\.0([KM])$/, "$1")}
                /
                {((threshold) =>
                  threshold >= 1000000
                    ? (threshold / 1000000).toFixed(1) + "M"
                    : threshold >= 1000
                    ? (threshold / 1000).toFixed(1) + "K"
                    : threshold)(
                  LEVEL_XP_THRESHOLDS[
                    Math.min(
                      LEVEL_XP_THRESHOLDS.findIndex(
                        (threshold) => state.experience < threshold
                      ),
                      LEVEL_XP_THRESHOLDS.length - 1
                    )
                  ] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1]
                )
                  .toString()
                  .replace(/\.0([KM])$/, "$1")}
                <span className="ml-0.5 text-[8px]">XP</span>)
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full bg-[#5d3c1c] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FFB938]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              {state.level}
            </div>
            <span className="text-white/70 text-[8px]">
              (
              {(state.experience >= 1000000
                ? (state.experience / 1000000).toFixed(1) + "M"
                : state.experience >= 1000
                ? (state.experience / 1000).toFixed(1) + "K"
                : state.experience.toString()
              ).replace(/\.0([KM])$/, "$1")}
              /
              {((threshold) =>
                threshold >= 1000000
                  ? (threshold / 1000000).toFixed(1) + "M"
                  : threshold >= 1000
                  ? (threshold / 1000).toFixed(1) + "K"
                  : threshold)(
                LEVEL_XP_THRESHOLDS[
                  Math.min(
                    LEVEL_XP_THRESHOLDS.findIndex(
                      (threshold) => state.experience < threshold
                    ),
                    LEVEL_XP_THRESHOLDS.length - 1
                  )
                ] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1]
              )
                .toString()
                .replace(/\.0([KM])$/, "$1")}
              <span className="ml-0.5 text-[8px]">XP</span>)
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

        {showOgButton && (
          <div className="flex flex-col items-center w-[48px]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowMintOGBadge(true);
              }}
              className={`py-[9px] px-[6px] bg-[#FFB938] text-[#5d3c1c] rounded-full flex items-center justify-center transition-colors relative shadow-lg shadow-[#A17449]/50 animate-pulse`}
            >
              <span className="text-xs">OG</span>
            </motion.button>
          </div>
        )}

        <motion.div
          className="h-[42px] flex gap-1 items-center text-white/90 tracking-wide font-bold"
          whileHover={{ scale: 1.02 }}
          animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
        >
          <span
            className={`${
              state.coins > 9999 ? "text-md" : "text-lg"
            } mb-1 mr-1 mt-[-5px] pt-2`}
          >
            🪙
          </span>
          <span
            className={`${
              state.coins > 9999 ? "text-xs" : "text-lg"
            } mb-1 mr-1 pt-2`}
          >
            {state.coins}
          </span>
        </motion.div>
      </div>

      {/* streak counter button */}
      <motion.div
        className={`h-[42px] flex flex-row flex gap-1 items-center text-white/90 tracking-wide font-bold cursor-pointer relative
          ${state.claimableStreakReward ? "bg-transparent animate-pulse" : ""}`}
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowStreaks(true)}
      >
        {state.claimableStreakReward && (
          <div className="absolute -top-[-3px] -right-1 w-3 h-3 bg-[#FFD700] rounded-full z-30" />
        )}
        <Image
          src="/images/special/fire.png"
          alt="Streak"
          width={22}
          height={22}
          className="mt-[-2px]"
        />
        <p
          className={`${
            state.currentStreakDays > 9999 ? "text-xs" : "text-md"
          } ${
            state.claimableStreakReward
              ? "drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"
              : ""
          }`}
        >
          {state.currentStreakDays}
        </p>
      </motion.div>

      <motion.div
        className={`h-[42px] mr-1 flex gap-1 items-center text-white/90 tracking-wide font-bold ${
          state.coins > 9999 ? "text-sm" : "text-md"
        }`}
        whileHover={{ scale: 1.02 }}
        animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
      >
        <span className="mt-[-5px]">🪙</span>
        <span>{state.coins}</span>
      </motion.div>
    </div>
  );
}
