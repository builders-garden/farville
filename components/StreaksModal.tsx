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
import { Plus } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { DbStreak } from "@/supabase/types";

const getStreakDates = (streaks: DbStreak[]) => {
  const dates: Date[] = [];

  streaks.forEach((streak) => {
    if (streak.endedAt) {
      const startDate = new Date(streak.startedAt);
      const endDate = new Date(streak.endedAt);
      for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    } else {
      const startDate = new Date(streak.startedAt);
      const lastActionDate = new Date(streak.lastActionAt);
      for (let d = startDate; d <= lastActionDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    }
  });

  return dates;
};

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
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

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

  const streakDates = getStreakDates(state.streaks);

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

  const hasPlayedToday = true; // This should come from your game state
  const frostsAvailable = 1; // This should come from your game state
  const maxFrosts = 2;

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
        <div className="p-6 flex flex-col gap-4">
          {/* New Streak Status Section */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,165,0,0.3)",
                "0 0 40px rgba(255,165,0,0.5)",
                "0 0 20px rgba(255,165,0,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-[#a13810] to-[#822800] 
                      rounded-2xl p-4 border-2 border-[#ffa07a]/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <span className="text-[#ffa07a] text-sm">Current Streak</span>
                <span className="text-5xl font-bold text-white/90">
                  {currentDayStreak}
                </span>
              </div>
              <motion.div
                animate={
                  hasPlayedToday
                    ? { rotate: [-5, 5, -5], scale: [0.95, 1.05, 0.95] }
                    : { rotate: [-3, 3, -3], scale: [0.98, 1.02, 0.98] }
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <Image
                  src={
                    hasPlayedToday
                      ? "/images/special/fire.png"
                      : "/images/special/frost.png"
                  }
                  alt={hasPlayedToday ? "Active Streak" : "Inactive Streak"}
                  width={70}
                  height={70}
                  className="drop-shadow-[0_2px_8px_rgba(255,165,0,0.5)]"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Frost Counter Card */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px rgba(155,220,255,0.3)",
                "0 0 20px rgba(155,220,255,0.5)",
                "0 0 10px rgba(155,220,255,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120]
                      rounded-2xl p-4 border border-[#FFD700]/20"
          >
            <div className="flex flex-row gap-3">
              <span className="text-white text-sm">Available Frosts</span>
              <div className="flex gap-3">
                {[...Array(maxFrosts)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={
                      i < frostsAvailable
                        ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              "0 0 10px rgba(155,220,255,0.3)",
                              "0 0 20px rgba(155,220,255,0.5)",
                              "0 0 10px rgba(155,220,255,0.3)",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center cursor-pointer
                        ${
                          i < frostsAvailable
                            ? "bg-gradient-to-br from-[#a8d7f7]/80 to-[#5ab5f5]/60 border-2 border-[#cce9ff]/50"
                            : "bg-[#5ab5f5]/40 border-2 border-[#cce9ff]/60"
                        }`}
                    onClick={() => {
                      setIsConfirmationOpen(true);
                    }}
                  >
                    {i < frostsAvailable ? (
                      <Image
                        src="/images/special/frost.png"
                        alt="Frost"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <span className="text-[#cce9ff] text-2xl font-bold">
                        <Plus />
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        {isConfirmationOpen && (
          <ConfirmationModal
            title="Buy streak frosts"
            message="Would you like to buy a frost for 🪙10000 coins?"
            onCancel={() => setIsConfirmationOpen(false)}
            onConfirm={() => {
              // Buy frost logic here
              setIsConfirmationOpen(false);
            }}
          />
        )}
        {/* Monthly streak stats */}
        {/* <div className="flex justify-between p-6 gap-6">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px rgba(255,69,0,0.3)",
                "0 0 20px rgba(255,69,0,0.5)",
                "0 0 10px rgba(255,69,0,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="flex flex-col gap-2 
              bg-gradient-to-br from-[#a13810]/90 to-[#822800]/80
              backdrop-blur-sm
              border-2 border-[#ffa07a]/50 p-6 py-4 w-full rounded-2xl
              shadow-inner shadow-[#ffffff50]"
          >
            <div className="flex text-4xl items-end justify-between gap-2">
              <span className="leading-none text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                6
              </span>
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Image
                  src="/images/special/fire.png"
                  alt="Fire"
                  width={38}
                  height={38}
                  className="drop-shadow-[0_2px_4px_rgba(255,69,0,0.5)]"
                />
              </motion.div>
            </div>
            <span className="text-[0.75rem] leading-none text-[#fea041] font-medium">
              Days streak
            </span>
          </motion.div>
          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px rgba(155,220,255,0.3)",
                "0 0 20px rgba(155,220,255,0.5)",
                "0 0 10px rgba(155,220,255,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="flex flex-col gap-2 
                bg-gradient-to-br from-[#a8d7f7]/80 to-[#5ab5f5]/60
                backdrop-blur-sm
                border-2 border-[#cce9ff]/50 p-6 py-4 w-full rounded-2xl
                shadow-inner shadow-[#ffffff50]"
          >
            <div className="flex flex-row text-4xl items-end justify-between gap-2">
              <span className="leading-none text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                14
              </span>
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Image
                  src={`/images/special/frost.png`}
                  alt="Frost"
                  width={32}
                  height={32}
                  className="drop-shadow-[0_2px_4px_rgba(155,220,255,0.5)]"
                />
              </motion.div>
            </div>
            <span className="text-[0.75rem] leading-none text-[#4d60be] font-medium">
              Used frosts
            </span>
          </motion.div>
        </div> */}
        <Calendar
          mode="multiple"
          selected={streakDates}
          className="rounded-md w-auto mx-6 
                    [&_.selected]:bg-[#FFB938] [&_.selected]:text-[#5B4120]"
          disabled={state.frosts.map((frost) => new Date(frost))}
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
