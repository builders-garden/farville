import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { useEffect, useState } from "react";
import { MONTHLY_REWARDS } from "@/lib/game-constants";
import { useGame } from "@/context/GameContext";

interface StreakReward {
  day: number;
  rewards: {
    itemId: number;
    icon: string;
    quantity: number;
  }[];
  claimable: boolean;
  claimed?: boolean; // Add claimed status
}

export default function StreaksModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const {
    state,
    claimRewards,
    isActionInProgress: isClaimInProgress,
  } = useGame();
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [activeReward, setActiveReward] = useState<StreakReward | undefined>(
    undefined
  );

  const currentDayStreak = 80;

  const handleClaim = (day: number) => {
    console.log("Claiming rewards for day", day);
    const reward = rewards.find((r) => r.day === day);
    if (reward) {
      const rewards = reward.rewards.map((r) => ({
        itemId: r.itemId,
        quantity: r.quantity,
      }));

      claimRewards({
        rewards,
      });

      // TODO: this will be removed for Streaks refetch
      setActiveReward({
        ...reward,
        claimable: false,
        claimed: true,
      });
    }
  };

  const dates = [
    new Date(2025, 1, 1),
    new Date(2025, 1, 2),
    new Date(2025, 1, 3),
    new Date(2025, 1, 5),
    new Date(2025, 1, 6),
    new Date(2025, 1, 7),
    new Date(2025, 1, 10),
  ];

  useEffect(() => {
    // Calculate the effective day within the monthly cycle
    const effectiveDay = ((currentDayStreak - 1) % 28) + 1;

    // take from MONTHLY_REWARDS only the rewards starting from currentStreak day
    let currentRewards = MONTHLY_REWARDS;
    if (effectiveDay > 3) {
      currentRewards = MONTHLY_REWARDS.slice(
        effectiveDay - 3,
        MONTHLY_REWARDS.length
      );
    }

    const streaksRewards = currentRewards.map((reward) => {
      // Adjust the day number to match the actual streak while keeping reward pattern
      const actualDay = currentDayStreak - (effectiveDay - reward.day);

      const streak: StreakReward = {
        day: actualDay,
        rewards: [],
        claimable: actualDay === currentDayStreak,
        claimed: actualDay < currentDayStreak, // Mark previous days as claimed
      };

      for (const item of reward.rewards) {
        const itemData = state.items.find((i) => i.id === item.itemId);
        if (itemData) {
          streak.rewards.push({
            itemId: item.itemId,
            icon: itemData.icon,
            quantity: item.quantity,
          });
        }
      }

      if (actualDay === currentDayStreak) {
        setActiveReward(streak);
      }

      return streak;
    });

    setRewards(streaksRewards);
  }, [state.items, currentDayStreak]);

  console.log({
    rewards,
    activeReward,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {isClaimInProgress && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full"
          />
        </div>
      )}
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
        className="bg-[#7e4e31] w-full h-full flex flex-col overflow-y-auto"
      >
        <div className="p-6 border-b border-[#8B5c3C]">
          <div className="flex justify-between max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-1">
              <motion.h2
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/streaks.png"
                  alt="Streaks"
                  width={35}
                  height={35}
                />
                Streaks
              </motion.h2>
              <p className="text-white/60 text-[10px]">
                Earn rewards farming daily!
              </p>
              <motion.p
                className="text-amber-500/90 text-[8px] drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]"
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Plant, harvest or boost to keep it up
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
        <div className="flex justify-between p-6 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col gap-2 bg-[#6d4c2c]
                     border-2 border-[#8B5d3C] p-6 py-4 w-full rounded-2xl"
          >
            <div className="flex text-4xl text-white items-end gap-2">
              <span className="leading-none">6</span>
              <span className="text-sm text-white/70">days</span>
            </div>
            <span className="text-[0.75rem] leading-none text-[#ea9712]">
              Streak
            </span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col gap-2 bg-[#6d4c2c]
                    border-2 border-[#8B5c3C] p-6 py-4 w-full rounded-2xl"
          >
            <div className="flex text-4xl text-white items-end gap-2">
              <span className="leading-none">14</span>
              <span className="text-sm text-white/70">Feb</span>
            </div>
            <span className="text-[0.75rem] leading-none text-[#ea9712]">
              Reward
            </span>
          </motion.div>
        </div>
        <Calendar
          mode="multiple"
          selected={dates}
          className="rounded-md w-auto mx-6 
                    [&_.selected]:bg-[#FFB938] [&_.selected]:text-[#5B4120]"
          disabled={new Date(2025, 1, 13)}
        />
        <div className="flex-1 mt-4 px-6">
          <Timeline>
            {rewards.map((reward) => {
              const isActivePrecursor = reward.day === currentDayStreak - 1;
              const isActive = reward.day === currentDayStreak;

              const rewardToUse = isActive ? activeReward : reward;

              if (!rewardToUse) {
                return null;
              }

              return (
                <TimelineItem key={rewardToUse.day}>
                  <TimelineSeparator>
                    <TimelineDot
                      className={`mt-0 p-6 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#5B4120] scale-110 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                          : rewardToUse.day > currentDayStreak
                          ? "bg-[#5B4120]/50 text-[#FFB938]/50"
                          : "bg-[#feb938] text-[#5B4120]"
                      }`}
                    >
                      {rewardToUse.day}
                    </TimelineDot>
                    <TimelineConnector
                      className={`my-0 ${
                        rewardToUse.day === currentDayStreak
                          ? "bg-gradient-to-b from-[#FFD700]/20 to-[#5B4120]"
                          : isActivePrecursor
                          ? "bg-gradient-to-b from-[#5B4120] to-[#FFD700]/20"
                          : "bg-[#5B4120]"
                      }
                         w-1`}
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <motion.div
                      initial={false}
                      animate={
                        isActive && !rewardToUse.claimed
                          ? {
                              scale: [1, 1.02, 1],
                              transition: {
                                duration: 2,
                                repeat: Infinity,
                              },
                            }
                          : {}
                      }
                      className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] p-4 rounded-lg 
                                border border-[#FFD700]/20 
                                ${
                                  rewardToUse.day > currentDayStreak
                                    ? "opacity-30"
                                    : ""
                                }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="text-[#feb938] text-sm font-semibold flex justify-between items-center">
                          <span>Rewards</span>
                          {rewardToUse.claimed && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">
                              Claimed
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 my-2 items-center">
                          {rewardToUse.rewards.map((item, idx) => (
                            <motion.div
                              key={idx}
                              className="p-2 bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                                   shadow-lg hover:shadow-xl transition-shadow duration-200
                                   border-2 border-[#8B5E3C]"
                              whileHover={{ scale: 1.02 }}
                            >
                              <motion.img
                                src={`/images${item.icon}`}
                                alt={`${item.itemId} seed`}
                                className="w-8 h-8 object-contain"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              <motion.div
                                className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
                                     rounded-full font-bold shadow-md border border-[#7E4E31]"
                                animate={{
                                  scale: item.quantity ? [1, 1.1, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                {item.quantity}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                        {isActive && !rewardToUse.claimed && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                              boxShadow: [
                                "0 0 10px rgba(255,215,0,0.3)",
                                "0 0 20px rgba(255,215,0,0.5)",
                                "0 0 10px rgba(255,215,0,0.3)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            onClick={() => handleClaim(rewardToUse.day)}
                            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#5B4120] 
                                     px-4 py-2 rounded-lg mt-2 font-bold text-sm 
                                     hover:from-[#FFA500] hover:to-[#FFD700] transition-all
                                     shadow-[0_0_15px_rgba(255,215,0,0.3)]
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!rewardToUse.claimable}
                          >
                            Claim Reward
                          </motion.button>
                        )}
                        {isActive && rewardToUse.claimed && (
                          <div className="text-white/60 text-xs mt-2">
                            Come back tomorrow for new rewards!
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </div>
      </motion.div>
    </div>
  );
}
