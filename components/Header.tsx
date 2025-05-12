"use client";

import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import { getCurrentLevelAndProgress, modeAvailableForUser } from "@/lib/utils";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Mode } from "@/lib/types/game";
import { AnimatedCircularProgressBar } from "./ui/animated-circular-progress-bar";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
// import { OG_FIDS_LIST } from "@/lib/contracts/constants";

export default function Header() {
  const {
    mode,
    setMode,
    state,
    setShowTimeline,
    setShowStreaks,
    setShowNotActiveMode,
    setShowDonations,
  } = useGame();
  const { progress } = getCurrentLevelAndProgress(state.experience);

  const availableUserModes = Object.values(Mode).filter((modeValue) =>
    modeAvailableForUser(modeValue, state.user.fid)
  ).length;

  return (
    <div className="px-4 py-2 z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div
          className="h-[42px] rounded-xl flex items-center cursor-pointer"
          onClick={() => setShowTimeline(true)}
        >
          <div className="w-fit">
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={progress}
              gaugePrimaryColor="#FFB938"
              gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
              className="w-[44px] h-[44px] rounded-full bg-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex flex-col items-center justify-center h-full text-white/90 font-semibold tracking-wide">
                <span className="text-[10px] leading-none mb-0.5">
                  {state.level}
                </span>
                <Image
                  src="/images/icons/experience.png"
                  alt="Level"
                  width={12}
                  height={12}
                  className="opacity-90"
                />
              </div>
            </AnimatedCircularProgressBar>
            {/* <span className="text-white/70 text-[8px]">
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
              </span> */}
            {/* <div className="mt-1.5 h-1.5 w-full bg-[#5d3c1c] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FFB938]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              {state.level}
            </div> */}
          </div>
        </div>

        {/* {showOgButton && (
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
        )} */}

        {/* Currency elements container - column on mobile, row on desktop */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 items-end">
          {/* Gift fertilizers */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDonations(true)}
          >
            <Image
              src="/images/special/gift.png"
              alt="gift"
              width={22}
              height={22}
              className="mt-[-2px] cursor-pointer"
            />
          </motion.div>

          {/* streak counter button */}
          <motion.div
            className={`h-auto xs:h-[42px] flex flex-row gap-1 items-center text-white/90 tracking-wide font-bold cursor-pointer relative
            ${
              state.claimableStreakReward ? "bg-transparent animate-pulse" : ""
            }`}
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowStreaks(true)}
          >
            {state.claimableStreakReward && (
              <div className="absolute -top-[1px] xs:-top-[-3px] -right-2 xs:-right-1 w-3 h-3 bg-[#FFD700] rounded-full z-30" />
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
            className={`h-auto xs:h-[42px] flex gap-1 items-center text-white/90 tracking-wide font-bold ${
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

        {availableUserModes > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#8B5E3C] hover:bg-[#6d4c2c] text-white border-[#6d4c2c] shadow-lg shadow-[#A17449]/50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 py-1 px-2.5 h-8 text-[10px]">
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#8B5E3C]/95 border-[#6d4c2c] backdrop-blur-sm w-44 mr-4">
              {Object.values(Mode).map(
                (modeValue) =>
                  modeAvailableForUser(modeValue, state.user.fid) && (
                    <DropdownMenuItem
                      key={modeValue}
                      onClick={() => {
                        if (modeValue !== mode) {
                          // check if the mode is not active
                          if (
                            MODE_DEFINITIONS[modeValue].startDate! > new Date()
                          ) {
                            setShowNotActiveMode({
                              show: true,
                              mode: modeValue,
                            });
                          } else {
                            setMode(modeValue);
                          }
                        }
                      }}
                      className={`flex items-center gap-2 text-white
              ${
                modeValue === mode
                  ? "bg-[#ffb938] cursor-not-allowed focus:bg-[#ffb938] text-[#5d3c1c]"
                  : "hover:bg-[#6d4c2c]/50 focus:bg-[#6d4c2c]/50 cursor-pointer focus:text-white"
              }`}
                    >
                      <Image
                        src={`/images/modes/${modeValue}.png`}
                        alt={modeValue}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-lg"
                      />
                      {modeValue.charAt(0).toUpperCase() + modeValue.slice(1)}
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
