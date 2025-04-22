"use client";

import { motion } from "framer-motion";
import { useFrameContext } from "../context/FrameContext";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";
import {
  EXPANSION_COSTS,
  LEVEL_REWARDS,
  LEVEL_XP_THRESHOLDS,
} from "@/lib/game-constants";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { useUserMe } from "@/hooks/use-user-me";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { useGame } from "@/context/GameContext";
import { Item } from "@prisma/client";

interface TimelineData {
  level: number;
  xp: number;
  rewards: {
    expansion?: number;
    coins: number;
    crops?: string[];
  };
}

function extractTimelineData(items: Item[]): TimelineData[] {
  // build here the timeline data using items, EXPANSION_COSTS, LEVEL_REWARDS, LEVEL_XP_THRESHOLDS
  const itemsOnlyCrops = items.filter(
    (item) => item.category !== "perk" && item.category !== "seed"
  );
  return LEVEL_XP_THRESHOLDS.map((xp, index) => {
    const level = index + 1;
    const expansion = EXPANSION_COSTS.find((cost) => cost.level === level);
    const reward = LEVEL_REWARDS[index].coins;
    const crops = itemsOnlyCrops
      .filter((item) => item.requiredLevel === level)
      ?.map((item) => item.slug);

    return {
      level,
      xp,
      rewards: {
        expansion: expansion?.nextSize.width || undefined,
        coins: reward || 0,
        crops: crops || undefined,
      },
    };
  });
}

export default function TimelineModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const { user, isLoading: isLoadingUser } = useUserMe();
  const [userStats, setUserStats] = useState<
    | {
        level: number;
        progress: number;
      }
    | undefined
  >(undefined);

  const { state } = useGame();

  useEffect(() => {
    if (state.items) {
      setTimelineData(extractTimelineData(state.items));
    }
  }, [state.items]);

  useEffect(() => {
    if (user) {
      const { currentLevel, progress } = getCurrentLevelAndProgress(user.xp);
      setUserStats({ level: currentLevel, progress });
    }
  }, [user]);

  const isLoading = isLoadingUser;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#FFB938] rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          style={{
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}
          className="bg-[#7E4E31] w-full h-full"
        >
          <div className="w-full h-full p-4 mt-2 flex flex-col">
            {/* Header */}
            <div className="border-b border-[#8B5E3C] pb-6">
              <div className="flex justify-between max-w-4xl mx-auto w-full">
                <div className="flex flex-col gap-1">
                  <motion.h2
                    className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                    animate={{ rotate: [0, -3, 3, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 5,
                    }}
                  >
                    🚜 Journey
                  </motion.h2>
                  <p className="text-white/60 text-[10px]">
                    it&apos;s not much but
                  </p>
                  <motion.p
                    className="text-amber-500/90 text-[10px] drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]"
                    animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    it&apos;s honest work
                  </motion.p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                                 flex items-center justify-center hover:rotate-90 transform duration-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
              <Card className="flex items-center bg-[#5B4120] border-none mb-4">
                <CardContent className="w-full p-4 gap-4">
                  <h3 className="text-white/90 font-semibold text-lg mb-2">
                    Level progress
                  </h3>
                  <div className="flex items-end justify-between">
                    <span className="text-white/90 font-semibold tracking-wide text-lg flex items-center gap-1">
                      <Image
                        src="/images/icons/experience.png"
                        alt="Level"
                        width={24}
                        height={24}
                      />
                      {state.level}
                    </span>
                    <span className="text-white/70 text-xs">
                      ({state.experience.toLocaleString()}/
                      {(
                        LEVEL_XP_THRESHOLDS[
                          Math.min(
                            LEVEL_XP_THRESHOLDS.findIndex(
                              (threshold) => state.experience < threshold
                            ),
                            LEVEL_XP_THRESHOLDS.length - 1
                          )
                        ] || LEVEL_XP_THRESHOLDS[LEVEL_XP_THRESHOLDS.length - 1]
                      ).toLocaleString()}
                      <span className="ml-0.5 text-[8px]">XP</span>)
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-[#b37437] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FFB938]"
                      initial={{ width: 0 }}
                      animate={{ width: `${userStats?.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Timeline>
                {timelineData.length > 0 && userStats ? (
                  timelineData.map((item) => (
                    <TimelineItem key={item.level}>
                      <TimelineSeparator
                        className={`${
                          item.level > userStats.level ? "opacity-30" : ""
                        }`}
                      >
                        <TimelineDot
                          className={`p-5 xs:p-6 rounded-full mt-0 ${
                            item.level === userStats.level
                              ? "bg-[#ffb938] text-[#5B4120]"
                              : "bg-[#5B4120] text-[#ffb938]"
                          }`}
                        >
                          {item.level}
                        </TimelineDot>
                        {item.level ===
                        timelineData[timelineData.length - 1].level ? null : (
                          <TimelineConnector
                            className={`bg-[#5B4120] w-1 my-0 ${
                              item.level === userStats.level ? "opacity-30" : ""
                            }`}
                          />
                        )}
                      </TimelineSeparator>
                      <TimelineContent
                        className={`text-white ${
                          item.level > userStats.level ? "opacity-30" : ""
                        }`}
                      >
                        <Card className="bg-[#5B4120] border-none p-4 gap-4">
                          <CardContent className="p-0 text-white">
                            <div className="flex flex-row justify-between">
                              {item.xp > 0 && item.level > 1 ? (
                                <>
                                  <p>
                                    {item.xp}
                                    <span className="ml-1">XP</span>
                                  </p>
                                </>
                              ) : (
                                `Let's start`
                              )}
                            </div>

                            <div className="flex flex-col gap-2 mt-4 text-[10px]">
                              {item.xp > 0 && item.level > 1 ? (
                                <>
                                  <div className="flex flex-row items-center justify-between">
                                    <span>Coins 💰</span>
                                    <p className="flex items-center justify-center rounded-xl">
                                      {`${item.rewards.coins}`}{" "}
                                      <span className="ml-1">🪙</span>
                                    </p>
                                  </div>
                                  {item.rewards.expansion && (
                                    <span className="flex flex-row items-center justify-between">
                                      <span>Grid expansion 🔓</span>
                                      <span>
                                        {item.rewards.expansion}x
                                        {item.rewards.expansion}
                                      </span>
                                    </span>
                                  )}
                                  {item.rewards.crops &&
                                    item.rewards.crops.length > 0 && (
                                      <div className="flex flex-row items-start justify-between">
                                        <span>New crops 🆕</span>
                                        <div className="flex flex-row flex-wrap gap-2 max-w-[50%]">
                                          {item.rewards.crops.map((crop) => (
                                            <div
                                              key={crop}
                                              className="flex items-center justify-center p-1 rounded-xl bg-[#ba7200]"
                                            >
                                              <motion.div
                                                animate={{
                                                  rotate: [0, -10, 10, 0],
                                                }}
                                                transition={{
                                                  duration: 0.5,
                                                  repeat: Infinity,
                                                  repeatDelay: 3,
                                                }}
                                                className="p-0"
                                              >
                                                <Image
                                                  src={`/images/crop/${crop}.png`}
                                                  alt={crop}
                                                  className="w-8 h-8"
                                                  width={16}
                                                  height={16}
                                                />
                                              </motion.div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </>
                              ) : (
                                <div className="flex flex-col gap-4">
                                  <p
                                    className={`text-sm font-bold ${
                                      item.level === userStats.level
                                        ? "text-[#5B4120]"
                                        : "text-[#FFB938]"
                                    }`}
                                  >
                                    Available crops
                                  </p>
                                  <div className="flex flex-row flex-wrap gap-2">
                                    {item.rewards.crops?.map((crop) => (
                                      <div
                                        key={crop}
                                        className="flex items-center justify-center p-1 rounded-xl bg-[#ba7200]"
                                      >
                                        <motion.div
                                          animate={{
                                            rotate: [0, -10, 10, 0],
                                          }}
                                          transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                          }}
                                          className="p-0"
                                        >
                                          <Image
                                            src={`/images/crop/${crop}.png`}
                                            alt={crop}
                                            className="w-8 h-8"
                                            width={16}
                                            height={16}
                                          />
                                        </motion.div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))
                ) : (
                  <p>Loading...</p>
                )}
              </Timeline>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
