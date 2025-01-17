"use client";

import { LEVEL_XP_THRESHOLDS } from "@/lib/game-constants";
import { useGame } from "../context/GameContext";
import { motion } from "framer-motion";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";

export default function Header() {
  const { state } = useGame();
  const { progress } = getCurrentLevelAndProgress(state.experience);

  return (
    <div className="bg-[#8B5E3C]/40 px-3 py-2 shadow-lg bg-opacity-95 backdrop-blur-sm border-b-2 border-[#6d4c2c]/50 z-30">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="relative">
          <div className="h-[42px] px-4 rounded-xl flex items-center">
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
          </div>
        </div>

        <p
          className="text-white/80 hover:text-white text-[8px] font-medium transition-colors"
          onClick={async () => {
            await sdk.actions.openUrl("https://docs.farville.farm/gameplay");
          }}
        >
          How to Play
        </p>

        <motion.div
          className="h-[42px] px-3 flex gap-1 items-center text-white/90 tracking-wide font-bold"
          whileHover={{ scale: 1.02 }}
          animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
        >
          <span
            className={`${
              state.coins > 9999 ? "text-sm" : "text-lg"
            } mb-1 mr-1 mt-[-5px]`}
          >
            🪙
          </span>
          <span
            className={`${
              state.coins > 9999 ? "text-xs" : "text-lg"
            } mb-1 mr-1`}
          >
            {state.coins}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
