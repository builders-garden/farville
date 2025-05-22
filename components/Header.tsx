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

export default function Header() {
  const {
    mode,
    setMode,
    state,
    setShowTimeline,
    setShowStreaks,
    setShowNotActiveMode,
    setShowFarmersPower,
  } = useGame();
  const { progress } = getCurrentLevelAndProgress(state.experience);

  const availableUserModes = Object.values(Mode).filter((modeValue) =>
    modeAvailableForUser(modeValue, state.user.fid)
  ).length;

  return (
    <div className="bg-[#8B5E3C]/40 px-4 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c]/50 z-30">
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
          </div>
        </div>

        {/* Currency elements container - column on mobile, row on desktop */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 items-end">
          {/* FarmersPower */}
          <motion.div
            className="flex flex-row gap-1 items-center cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFarmersPower(true)}
          >
            <Image
              src="/images/special/farmers-power.png" // You'll need to add this icon
              alt="FarmersPower"
              width={22}
              height={22}
              className="mt-[-2px] cursor-pointer"
            />
            <span className="text-white/90 font-bold text-md">
              x{state.communityBoosterStatus?.stage ?? 1}
            </span>
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
