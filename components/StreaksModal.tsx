import { Calendar } from "@/components/ui/calendar";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { useFrameContext } from "@/context/FrameContext";
import { useGame } from "@/context/GameContext";
import {
  FROST_COST,
  MAX_FROSTS_QUANTITY,
  MONTHLY_REWARDS,
} from "@/lib/game-constants";
import {
  getCurrentDayStreak,
  getStreakDates,
  streakFlexCardComposeCastUrl,
} from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmationModal from "./modals/ConfirmationModal";
import InfoModal from "./modals/InfoModal";
import sdk from "@farcaster/frame-sdk";
import { FloatingShareButton } from "./FloatingShareButton";

interface StreakReward {
  day: number;
  rewards: {
    itemId: number;
    icon: string;
    quantity: number;
  }[];
  claimable: boolean;
  claimed?: boolean;
  isLoading?: boolean;
}

export default function StreaksModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const {
    state,
    claimRewards,
    buyItem,
    isActionInProgress: isClaimInProgress,
  } = useGame();
  const [rewards, setRewards] = useState<StreakReward[]>([]);
  const [activeReward, setActiveReward] = useState<StreakReward | undefined>(
    undefined
  );
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isFrostInfoOpen, setIsFrostInfoOpen] = useState(false);
  const [timeUntilNextDay, setTimeUntilNextDay] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  const currentDayStreak = getCurrentDayStreak(
    state.streaks[0],
    state.frosts.lastStreakDates
  );

  // Calculate time until next day (UTC)
  useEffect(() => {
    const calculateTimeUntilNextDay = () => {
      const now = new Date();
      const nextDay = new Date();
      nextDay.setUTCHours(24, 0, 0, 0); // Next day at 00:00 UTC

      const diffMs = nextDay.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilNextDay({ hours, minutes, seconds });
    };

    calculateTimeUntilNextDay();
    const intervalId = setInterval(calculateTimeUntilNextDay, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClaim = (day: number) => {
    const reward = rewards.find((r) => r.day === day);
    if (reward) {
      setActiveReward({ ...reward, isLoading: true });

      claimRewards({
        streakId: state.streaks[0].id,
      });
    }
  };

  const handleShareStreak = async () => {
    const { castUrl } = streakFlexCardComposeCastUrl(
      state.user.fid,
      currentDayStreak
    );
    await sdk.actions.openUrl(castUrl);
  };

  const streakDates = getStreakDates(state.streaks);

  const lastClaimedDay = state.streaks[0] ? state.streaks[0].lastClaimed : 0;

  useEffect(() => {
    // Calculate the effective day within the monthly cycle
    const effectiveLastClaimedDay = ((lastClaimedDay - 1) % 28) + 1;

    // Handle cycle transition - when lastClaimed is a multiple of 28 and we're moving beyond it
    const isNewCycle =
      lastClaimedDay % 28 === 0 && currentDayStreak > lastClaimedDay;

    // Determine what range of rewards to show
    let startIndex, endIndex;

    if (isNewCycle) {
      // If we're transitioning to a new cycle, show rewards starting from day 1
      startIndex = 0;
      endIndex = 6; // Show 6 rewards
    } else {
      // Always show some rewards before the last claimed day, the current day to claim,
      // and a few upcoming rewards
      startIndex = Math.max(0, effectiveLastClaimedDay - 2); // Show 2 days before last claimed
      endIndex = startIndex + 6; // Show 6 rewards total
    }

    // Slice the rewards to show the relevant portion
    const currentRewards = MONTHLY_REWARDS.slice(startIndex, endIndex);

    const streaksRewards = currentRewards.map((reward) => {
      // Calculate which cycle we're in (1-based)
      const currentCycle =
        Math.floor((Math.max(1, lastClaimedDay) - 1) / 28) + 1;

      // Calculate the start day of the current cycle
      const cycleStartDay = (currentCycle - 1) * 28 + 1;

      // Calculate if we're starting a new cycle
      const isNewCycle =
        lastClaimedDay % 28 === 0 && currentDayStreak > lastClaimedDay;

      let actualDay;
      if (isNewCycle) {
        // For new cycle, start from the next cycle's start day
        actualDay = cycleStartDay + 28 + (reward.day - 1);
      } else {
        // For ongoing cycle, offset the reward day by the cycle start
        actualDay = cycleStartDay + (reward.day - 1);
      }

      const streak: StreakReward = {
        day: actualDay,
        rewards: [],
        claimable: actualDay <= currentDayStreak,
        claimed: actualDay <= lastClaimedDay,
      };

      // Add rewards
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

      // Set active reward if this is the next claimable day
      if (actualDay === lastClaimedDay + 1) {
        setActiveReward(streak);
      }

      return streak;
    });

    setRewards(streaksRewards);
  }, [state.items, currentDayStreak, lastClaimedDay]);

  const hasPlayedToday = true; // This should come from your game state
  const frostsAvailable =
    state.specialItems.find((item) => item.item.slug === "frost")?.quantity ||
    0;

  return (
    <div className="fixed max-w-md mx-auto inset-0 bg-black/50 flex items-start z-50">
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
        <div className="p-3 xs:p-4 mt-2 border-b border-[#8B5c3C]">
          <div className="flex justify-between max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-1">
              <motion.h2
                className="text-white/90 font-bold text-xl xs:text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/special/fire.png"
                  alt="Streaks"
                  width={30}
                  height={30}
                  className="w-7 h-7 xs:w-9 xs:h-9"
                />
                Streaks
              </motion.h2>
              <p className="text-white/60 text-[9px] xs:text-[10px]">
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
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-3 xs:p-4 flex flex-col gap-3 xs:gap-4">
            {/* Next Day Countdown */}
            <div className="bg-gradient-to-br from-[#8B5c3C] to-[#6d4c2c] rounded-xl p-2 xs:p-3 border border-[#ffa07a]/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 xs:gap-2 text-white/80">
                  <Clock size={16} className="text-[#FFB938]" />
                  <span className="text-[8px] xs:text-[9px]">Next day in:</span>
                </div>
                <div className="flex gap-1 text-white font-bold">
                  <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
                    {timeUntilNextDay.hours.toString().padStart(2, "0")}
                  </div>
                  <span className="text-[#FFB938] flex items-center">:</span>
                  <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
                    {timeUntilNextDay.minutes.toString().padStart(2, "0")}
                  </div>
                  <span className="text-[#FFB938] flex items-center">:</span>
                  <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
                    {timeUntilNextDay.seconds.toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>

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
                  <div className="flex items-center gap-4">
                    <span className="text-[#ffa07a] text-xs xs:text-sm">
                      Your Streak
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl xs:text-5xl font-bold text-white/90">
                      {currentDayStreak}
                    </span>
                  </div>
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
                  <div className="relative w-[65px] h-[65px] xs:w-[80px] xs:h-[80px]">
                    <Image
                      src={
                        hasPlayedToday
                          ? "/images/special/fire.png"
                          : "/images/special/frost.png"
                      }
                      alt={hasPlayedToday ? "Active Streak" : "Inactive Streak"}
                      className="object-contain drop-shadow-[0_2px_8px_rgba(255,165,0,0.5)]"
                      fill
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Frost Counter Card */}
            <motion.div
              className="bg-gradient-to-br from-sky-900 to-sky-700
                          rounded-2xl p-4 py-3 border border-sky-600"
            >
              <div className="flex flex-col gap-2">
                <p className="flex flex-row items-center text-sky-300 text-xs gap-2">
                  Streak Frosts
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col h-auto justify-between gap-2">
                    <p className="text-white text-sm font-bold">
                      {frostsAvailable}
                      <span className="text-sm text-white/50">/2</span>
                    </p>
                    <div className="flex w-full">
                      <button
                        className="text-[8px] text-sky-200/80 hover:text-sky-200 transition-colors px-2 py-1 rounded-md border border-sky-200/80"
                        onClick={() => setIsFrostInfoOpen(true)}
                      >
                        How it works?
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    {[...Array(MAX_FROSTS_QUANTITY)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 xs:w-16 xs:h-16 rounded-xl flex items-center justify-center
                            ${
                              i < frostsAvailable
                                ? "bg-gradient-to-br from-[#1E90FF]/80 to-[#00BFFF]/60 border-2 border-[#ADD8E6]/50 pointer-events-none"
                                : "bg-[#00BFFF]/40 border-2 border-[#ADD8E6]/60 cursor-pointer"
                            }`}
                        onClick={() => {
                          setIsConfirmationOpen(true);
                        }}
                      >
                        {i < frostsAvailable ? (
                          <Image
                            src="/images/special/frost.png"
                            alt="Frost"
                            width={38}
                            height={38}
                          />
                        ) : (
                          <span className="text-[#ADD8E6] text-2xl font-bold">
                            <Plus />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            {
              // Frost Info Card
              isFrostInfoOpen && (
                <InfoModal
                  title="Streak Frosts"
                  icon="/images/special/frost.png"
                  onCancel={() => setIsFrostInfoOpen(false)}
                  options={{
                    titleColor: "text-sky-200",
                  }}
                >
                  <div className="flex flex-col gap-4 my-4 text-white/80 text-sm">
                    <p>
                      Streak Frosts are special items that protect your streak,
                      even if you miss a day.
                    </p>
                    <p>
                      If you skip a day, a Frost will be automatically used.
                    </p>
                    <p>
                      Out of Frosts? Your streak will
                      <span className="text-red-500 font-bold"> DIE</span>!
                    </p>
                    <p>You can hold a maximum of 2 Frosts at a time.</p>
                  </div>
                </InfoModal>
              )
            }
          </div>
          {isConfirmationOpen && (
            <ConfirmationModal
              title="Buy Streaks Frosts"
              message={
                state.user.coins >= FROST_COST
                  ? `Do you want to buy a Streak Frost for ${FROST_COST}🪙 coins?`
                  : `You don't have enough coins to buy a Streak Frost. One costs ${FROST_COST}🪙 coins.`
              }
              onCancel={() => setIsConfirmationOpen(false)}
              onConfirm={() => {
                buyItem({ itemId: 29, quantity: 1 });
                setIsConfirmationOpen(false);
              }}
              confirmDisabled={state.user.coins < FROST_COST}
            />
          )}
          <div className="flex flex-col w-full gap-1 p-4 pt-4 pb-4">
            <h3 className="text-white/90 text-lg font-bold">Your Progress</h3>
            <p className="text-white/60 text-[10px]">
              Keep track of your daily activity
            </p>
          </div>
          <Calendar
            mode="multiple"
            selected={streakDates}
            className="rounded-md w-auto mx-4 
                            [&_.selected]:bg-[#FFB938] [&_.selected]:text-[#5B4120]"
            disabled={state.frosts.allFrostsDates.map(
              (frost) => new Date(frost)
            )}
          />
          <div className="flex flex-col w-full gap-1 p-4 pt-8 pb-2">
            <h3 className="text-white/90 text-lg font-bold">Rewards</h3>
            <p className="text-white/60 text-[10px]">
              Claim your rewards for the current streak
            </p>
          </div>
          <Timeline className="flex-1 mt-4 px-4">
            {rewards.map((reward) => {
              const isActivePrecursor = reward.day === lastClaimedDay;
              const isActive =
                reward.day === lastClaimedDay + 1 &&
                reward.day <= currentDayStreak;
              const isClaimableButDisabled =
                reward.day > lastClaimedDay + 1 &&
                reward.day <= currentDayStreak;

              const rewardToUse = isActive ? activeReward : reward;

              const allClaimed = lastClaimedDay === currentDayStreak;

              if (!rewardToUse) {
                return null;
              }

              return (
                <TimelineItem key={reward.day}>
                  <TimelineSeparator>
                    <TimelineDot
                      className={`mt-0 p-5 xs:p-6 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-[#5B4120] scale-110 shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                          : rewardToUse.day > lastClaimedDay
                          ? "bg-[#5B4120]/50 text-[#FFB938]/50"
                          : "bg-[#feb938] text-[#5B4120]"
                      }`}
                    >
                      {rewardToUse.day}
                    </TimelineDot>
                    <TimelineConnector
                      className={`my-0 ${
                        !allClaimed
                          ? rewardToUse.day === lastClaimedDay + 1
                            ? "bg-gradient-to-b from-[#FFD700]/20 to-[#5B4120]"
                            : isActivePrecursor
                            ? "bg-gradient-to-b from-[#5B4120] to-[#FFD700]/20"
                            : "bg-[#5B4120]"
                          : rewardToUse.day === currentDayStreak
                          ? "bg-gradient-to-b from-[#FFD700]/20 to-[#5B4120]"
                          : rewardToUse.day === currentDayStreak - 1
                          ? "bg-gradient-to-b from-[#5B4120] to-[#FFD700]/20"
                          : "bg-[#5B4120]"
                      } w-1`}
                    />
                  </TimelineSeparator>
                  <TimelineContent>
                    <motion.div
                      initial={false}
                      animate={
                        isActive &&
                        !rewardToUse.claimed &&
                        !isClaimableButDisabled
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
                                  rewardToUse.day > currentDayStreak ||
                                  isClaimableButDisabled
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
                        {(isActive || isClaimableButDisabled) &&
                          !rewardToUse.claimed && (
                            <motion.button
                              whileHover={
                                isClaimableButDisabled ? {} : { scale: 1.05 }
                              }
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
                              className={`bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#5B4120] 
                                 px-4 py-2 rounded-lg mt-2 font-bold text-sm 
                                 ${
                                   !isClaimableButDisabled
                                     ? "hover:from-[#FFA500] hover:to-[#FFD700]"
                                     : ""
                                 } transition-all
                                 shadow-[0_0_15px_rgba(255,215,0,0.3)]
                                 disabled:opacity-50 disabled:cursor-not-allowed`}
                              disabled={
                                !rewardToUse.claimable ||
                                isClaimableButDisabled ||
                                rewardToUse.isLoading
                              }
                            >
                              Claim
                            </motion.button>
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
      {currentDayStreak > 0 && (
        <FloatingShareButton onClick={handleShareStreak} />
      )}
    </div>
  );
}
