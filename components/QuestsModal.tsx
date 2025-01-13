"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useUserQuests } from "@/hooks/use-quests";
import Quest from "./Quest";
import { useUser } from "@/hooks/use-user";

type Tab = "active" | "completed" | "expired";

export default function QuestsModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const { user, isLoading: isLoadingUser } = useUser();
  const { quests, isLoading: isLoadingActiveQuests } = useUserQuests(user?.fid);
  const { quests: completedQuests, isLoading: isLoadingCompletedQuests } =
    useUserQuests(user?.fid, false);

  const isLoading =
    isLoadingUser || isLoadingActiveQuests || isLoadingCompletedQuests;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "active", label: "Active", icon: "⏰" },
    { id: "completed", label: "Completed", icon: "✅" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50 mb-4">
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
                  quests?.map((quest) => (
                    <Quest quest={quest} key={quest.id} completed={false} />
                  ))}

                {activeTab === "completed" &&
                  completedQuests?.map((quest) => (
                    <Quest quest={quest} key={quest.id} completed={true} />
                  ))}

                {quests?.length === 0 && activeTab === "active" && (
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
