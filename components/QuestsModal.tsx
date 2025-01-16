"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useUserQuests } from "@/hooks/use-quests";
import Quest from "./Quest";
import { useUser } from "@/hooks/use-user";

type Tab = "active" | "claimable" | "expired";
type SubTab = "daily" | "weekly" | "monthly" | "farmer";

export default function QuestsModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("daily");
  const { user, isLoading: isLoadingUser } = useUser();
  const { quests, isLoading: isLoadingActiveQuests } = useUserQuests(
    user?.fid,
    "incomplete"
  );
  const { quests: claimableQuests, isLoading: isLoadingClaimableQuests } =
    useUserQuests(user?.fid, "completed");

  const isLoading =
    isLoadingUser || isLoadingActiveQuests || isLoadingClaimableQuests;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "active", label: "Active", icon: "⏰" },
    { id: "claimable", label: "Claimable", icon: "✅" },
  ];

  const subTabs = [
    { id: "daily", label: "D", icon: "📅" },
    { id: "weekly", label: "W", icon: "📅" },
    { id: "monthly", label: "M", icon: "📆" },
    { id: "farmer", label: "G", icon: "🌾" },
  ];

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
        <div className="w-full h-full p-6 flex flex-col">
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

            {/* Subtabs - Only show when active tab is selected */}
            {activeTab === "active" && (
              <div className="grid grid-cols-4 gap-2 mb-6 bg-[#573d23] p-2 rounded-lg">
                {subTabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveSubTab(tab.id as SubTab)}
                    className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200
                      ${
                        activeSubTab === tab.id
                          ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                          : "text-white/70 hover:bg-[#6d4c2c]/50"
                      }`}
                    whileHover={{
                      scale: activeSubTab === tab.id ? 1.05 : 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      animate={{
                        rotate: activeSubTab === tab.id ? [0, -5, 5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="mt-[-10px]"
                    >
                      {tab.icon}
                    </motion.span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            )}
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
                {activeTab === "active" && (
                  <div className="flex flex-col text-white/70 text-sm gap-2">
                    {activeSubTab === "daily" &&
                      (quests?.daily.length === 0 ? (
                        <div>No daily quests available.</div>
                      ) : (
                        quests?.daily.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))
                      ))}
                    {activeSubTab === "weekly" &&
                      (quests?.weekly.length === 0 ? (
                        <div>No weekly quests available.</div>
                      ) : (
                        quests?.weekly.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))
                      ))}
                    {activeSubTab === "monthly" &&
                      (quests?.monthly.length === 0 ? (
                        <div>No monthly quests available.</div>
                      ) : (
                        quests?.monthly.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))
                      ))}
                    {activeSubTab === "farmer" &&
                      (quests?.farmer.length === 0 ? (
                        <div>No farmer quests available.</div>
                      ) : (
                        quests?.farmer.map((quest) => (
                          <Quest
                            quest={quest}
                            key={quest.id}
                            claimable={false}
                          />
                        ))
                      ))}
                  </div>
                )}

                {activeTab === "claimable" && (
                  <div className="flex flex-col gap-2">
                    {claimableQuests?.daily.map((quest) => (
                      <Quest quest={quest} key={quest.id} claimable={true} />
                    ))}
                    {claimableQuests?.weekly.map((quest) => (
                      <Quest quest={quest} key={quest.id} claimable={true} />
                    ))}
                    {claimableQuests?.monthly.map((quest) => (
                      <Quest quest={quest} key={quest.id} claimable={true} />
                    ))}
                    {claimableQuests?.farmer.map((quest) => (
                      <Quest quest={quest} key={quest.id} claimable={true} />
                    ))}
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
