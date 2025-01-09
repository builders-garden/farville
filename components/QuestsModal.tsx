"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useQuests } from "@/hooks/use-quests";
import { DbQuest, DbQuestWithItem } from "@/supabase/types";
import Image from "next/image";

type Tab = "active" | "completed" | "expired";

export default function QuestsModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const { activeQuests, isLoading } = useQuests();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "active", label: "Active", icon: "⏰" },
    { id: "completed", label: "Completed", icon: "✅" },
  ];

  const renderQuestRewards = (quest: DbQuest) => (
    <div className="flex items-center gap-2 text-xs mt-2">
      {quest.xp && (
        <span className="text-white/60 flex items-center">
          XP{" "}
          <span className="text-yellow-400 font-medium flex items-center">
            <span className="text-sm mb-1 ml-1 mr-0.5">⭐</span>
            {quest.xp}
          </span>
        </span>
      )}
      {quest.coins && (
        <>
          <span className="text-white/40">•</span>
          <span className="text-white/60 flex items-center">
            Coins{" "}
            <span className="text-[#FFB938] font-medium flex items-center">
              <span className="text-sm mb-1 ml-1 mr-0.5">🪙</span>
              {quest.coins}
            </span>
          </span>
        </>
      )}
    </div>
  );

  const renderQuestProgress = (quest: DbQuest) => {
    const progress = 0; // TODO: Implement progress tracking
    const target = quest.amount || 0;

    return (
      <div className="relative w-full bg-[#5c4121] rounded-full h-5 my-2">
        <div
          className="bg-[#f2a311] h-5 rounded-full transition-all duration-300"
          style={{ width: `${(progress / target) * 100}%` }}
        >
          <div className="absolute w-full text-center text-xs text-white/80 mt-[3px]">
            {progress}/{target}
          </div>
        </div>
      </div>
    );
  };

  const questDescription = (quest: DbQuestWithItem) => {
    if (quest.amount && quest.itemId) {
      return `Collect ${quest.amount} ${quest.items?.name.toLowerCase()}`;
    } else if (quest.amount) {
      return `Complete ${quest.amount} tasks`;
    } else if (quest.itemId) {
      return `Collect ${quest.itemId} items`;
    } else {
      return "Complete the quest";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
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
        <div className="max-w-4xl mx-auto w-full h-full p-6 flex flex-col">
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
            <div className="grid grid-cols-2 gap-2 mb-6">
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
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading ? (
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
                {activeTab === "active" &&
                  activeQuests?.map((quest) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col gap-2
                               border border-[#8B5E3C]/50 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <motion.div
                            className="text-2xl"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Image
                              src={
                                `/images${quest.items?.icon}` ||
                                "/icons/quest.svg"
                              }
                              width={40}
                              height={40}
                              alt={`Quest icon for ${quest.category}`}
                            />
                          </motion.div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-white/90 font-medium">
                            {quest.category.charAt(0).toUpperCase() +
                              quest.category.slice(1)}{" "}
                            Quest
                          </h3>
                          <p className="text-white/60 text-xs">
                            {questDescription(quest)}
                          </p>
                          {renderQuestRewards(quest)}
                        </div>
                      </div>
                      {renderQuestProgress(quest)}
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">
                          {quest.endAt && (
                            <span className="ml-auto">
                              Ends in:{" "}
                              {(() => {
                                const timeRemaining =
                                  new Date(quest.endAt).getTime() - Date.now();
                                if (timeRemaining <= 0) return "";

                                const days = Math.floor(
                                  timeRemaining / (1000 * 60 * 60 * 24)
                                );
                                const hours = Math.floor(
                                  (timeRemaining % (1000 * 60 * 60 * 24)) /
                                    (1000 * 60 * 60)
                                );
                                const minutes = Math.floor(
                                  (timeRemaining % (1000 * 60 * 60)) /
                                    (1000 * 60)
                                );
                                const seconds = Math.floor(
                                  (timeRemaining % (1000 * 60)) / 1000
                                );

                                return `${days > 0 ? `${days}d ` : ""}
                                  ${hours > 0 ? `${hours}h ` : ""}
                                    ${
                                      minutes > 0
                                        ? `${minutes}m`
                                        : `${seconds}s`
                                    }`;
                              })()}
                            </span>
                          )}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                {activeTab === "completed" && (
                  <div className="text-center text-white/60 py-8">
                    No completed quests yet
                  </div>
                )}

                {activeQuests?.length === 0 && activeTab === "active" && (
                  <div className="text-center text-white/60 py-8">
                    No active quests available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
