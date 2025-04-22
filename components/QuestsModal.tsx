"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useFrameContext } from "../context/FrameContext";
import Quest from "./Quest";
import FloatingNumber from "@/components/animations/FloatingNumber";
import Confetti from "./animations/Confetti";
import { AllQuests } from "@/hooks/use-game-state";
import { Clock } from "lucide-react";

type Tab = "daily" | "weekly";

export default function QuestsModal({
  onClose,
  completedQuests,
  incompleteQuests,
  isLoadingUserQuests,
  refetchIncompleteQuests,
  refetchClaimableQuests,
  refetchUser,
}: {
  onClose: () => void;
  completedQuests: AllQuests | undefined;
  incompleteQuests: AllQuests | undefined;
  isLoadingUserQuests: boolean;
  refetchIncompleteQuests: () => void;
  refetchClaimableQuests: () => void;
  refetchUser: () => Promise<void>;
}) {
  const { safeAreaInsets } = useFrameContext();
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  const tabs = [
    { id: "daily" as Tab, label: "daily", icon: "☀️" },
    { id: "weekly" as Tab, label: "weekly", icon: "🛤️" },
  ];

  const [rewardAnimation, setRewardAnimation] = useState<{
    questId: number;
    x: number;
    y: number;
    xp?: number;
    coins?: number;
  } | null>(null);

  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);

  const [timeUntilReset, setTimeUntilReset] = useState({
    daily: { days: 0, hours: 0, minutes: 0 },
    weekly: { days: 0, hours: 0, minutes: 0 },
  });

  useEffect(() => {
    const calculateTimeUntilReset = () => {
      const now = new Date();

      // Daily reset (00:00 UTC)
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      const dailyDiff = tomorrow.getTime() - now.getTime();

      // Weekly reset (Monday 00:00 UTC)
      const nextMonday = new Date();
      nextMonday.setUTCHours(0, 0, 0, 0);
      nextMonday.setDate(
        nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)
      );
      const weeklyDiff = nextMonday.getTime() - now.getTime();

      return {
        daily: {
          days: Math.floor(dailyDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((dailyDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((dailyDiff / (1000 * 60)) % 60),
        },
        weekly: {
          days: Math.floor(weeklyDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((weeklyDiff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((weeklyDiff / (1000 * 60)) % 60),
        },
      };
    };

    const timer = setInterval(() => {
      setTimeUntilReset(calculateTimeUntilReset());
    }, 60000);

    setTimeUntilReset(calculateTimeUntilReset());

    return () => clearInterval(timer);
  }, []);

  const NoQuestsMessage = ({ type }: { type: "daily" | "weekly" }) => (
    <div className="flex flex-col gap-2">
      <div className="text-xs px-1 py-2">No {type} quests available.</div>
      <div className="bg-[#6d4c2c]/80 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-white/80">
          <Clock
            size={16}
            className="text-[#FFB938]"
          />
          <span className="text-[10px]">New quests in:</span>
        </div>
        <div className="flex gap-1 text-white font-bold">
          {timeUntilReset[type].days > 0 && (
            <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[11px] min-w-[22px] text-center">
              {timeUntilReset[type].days}
              <span className="text-[#FFB938] ml-0.5">d</span>
            </div>
          )}
          <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[11px] min-w-[22px] text-center">
            {timeUntilReset[type].hours.toString().padStart(2, "0")}
            <span className="text-[#FFB938] ml-0.5">h</span>
          </div>
          <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[11px] min-w-[22px] text-center">
            {timeUntilReset[type].minutes.toString().padStart(2, "0")}
            <span className="text-[#FFB938] ml-0.5">m</span>
          </div>
        </div>
      </div>
    </div>
  );

  const handleQuestClaim = async (
    questId: number,
    x: number,
    y: number,
    didLevelUp: boolean
  ) => {
    const quest = [
      ...(completedQuests?.daily || []),
      ...(completedQuests?.weekly || []),
    ].find((q) => q.questId === questId);

    if (quest) {
      setRewardAnimation({
        questId,
        x,
        y,
        xp: quest.quest.xp || undefined,
        coins: quest.quest.coins || undefined,
      });

      if (didLevelUp) {
        setShowLevelUpConfetti(true);
        setTimeout(() => {
          setShowLevelUpConfetti(false);
        }, 3000);
      }

      setTimeout(() => setRewardAnimation(null), 5000);
      refetchIncompleteQuests();
      refetchClaimableQuests();
      refetchUser();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {showLevelUpConfetti && <Confetti title="LEVEL UP!" />}
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
          <div className="flex-none">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <motion.h2
                  className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                  animate={{ rotate: [0, -3, 3, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <span className="text-3xl">📜</span> Quests
                </motion.h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                         flex items-center justify-center hover:rotate-90 transform duration-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                        : "text-white/70 hover:bg-[#6d4c2c]/50"
                    }`}
                  whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    animate={{
                      rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
            {isLoadingUserQuests ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-2xl"
                >
                  🔄
                </motion.div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col text-white/70 text-sm gap-4">
                  {activeTab === "daily" &&
                    (incompleteQuests?.daily.length === 0 &&
                    completedQuests?.daily.length === 0 ? (
                      <NoQuestsMessage type="daily" />
                    ) : (
                      <>
                        {completedQuests?.daily.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={true}
                            onClaim={handleQuestClaim}
                          />
                        ))}
                        {incompleteQuests?.daily.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))}
                      </>
                    ))}

                  {activeTab === "weekly" &&
                    (incompleteQuests?.weekly.length === 0 &&
                    completedQuests?.weekly.length === 0 ? (
                      <NoQuestsMessage type="weekly" />
                    ) : (
                      <>
                        {completedQuests?.weekly.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={true}
                            onClaim={handleQuestClaim}
                          />
                        ))}
                        {incompleteQuests?.weekly.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))}
                      </>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {rewardAnimation && rewardAnimation.xp && (
        <FloatingNumber
          number={rewardAnimation.xp}
          x={rewardAnimation.x}
          y={rewardAnimation.y}
          type="xp"
        />
      )}
      {rewardAnimation && rewardAnimation.coins && (
        <FloatingNumber
          number={rewardAnimation.coins}
          x={rewardAnimation.x}
          y={rewardAnimation.y + 40}
          type="coins"
        />
      )}
    </div>
  );
}
