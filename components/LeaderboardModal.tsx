"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useLeaderboard } from "@/hooks/use-leadeboard";
import { LEVEL_XP_THRESHOLDS } from "@/lib/constants";

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const { users } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  //const [searchQuery, setSearchQuery] = useState("");
  const { safeAreaInsets } = useFrameContext();

  // const currentLeaderboard =
  //   activeTab === "global" ? MOCK_GLOBAL_LEADERBOARD : MOCK_FRIENDS;

  // const filteredLeaderboard = users?.filter((entry) =>
  //   entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  const handleClose = () => {
    onClose();
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
          <div className="flex-none">
            <div className="flex justify-between items-center mb-6">
              <div>
                <motion.h2
                  className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                  animate={{ rotate: [0, -3, 3, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <span className="text-3xl">🏆</span> Leaderboard
                </motion.h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                         flex items-center justify-center hover:rotate-90 transform duration-200"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { id: "global", label: "Global", icon: "🌍" },
                // { id: "friends", label: "Friends", icon: "👥" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveTab(tab.id as "global" | "friends")}
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

          {/* Search Bar */}
          {/* <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg bg-[#6d4c2c] text-white/90 placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-[#FFB938] border border-white/10"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
              🔍
            </span>
          </div> */}

          {/* Scrollable leaderboard list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {users &&
                users.map((entry, index) => (
                  <motion.div
                    key={entry.fid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex items-center gap-3
                           border border-[#8B5E3C]/50 shadow-md"
                  >
                    <div className="px-2 py-1 flex items-center justify-center bg-[#5c4121] rounded-lg text-white/90 text-xs">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white/90 font-medium">
                          {entry.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/60">
                        <span className="bg-[#FFB938] text-[#7E4E31] px-2 py-0.5 rounded-full font-medium">
                          Level{" "}
                          {LEVEL_XP_THRESHOLDS.findIndex(
                            (threshold) => entry.xp < threshold
                          ) + 1}
                        </span>
                        <span>XP:{entry.xp.toLocaleString()}</span>
                        <span className="flex items-center gap-1">
                          <span className="text-[#FFB938]">🪙</span>
                          {entry.coins.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
