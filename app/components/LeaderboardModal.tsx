"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { useState } from "react";
import { useAudio } from "../context/AudioContext";

// Temporary mock data - replace with real data later
const MOCK_GLOBAL_LEADERBOARD = [
  { id: 1, name: "FarmerJoe", level: 25, experience: 2480, coins: 15000 },
  { id: 2, name: "CropMaster", level: 23, experience: 2350, coins: 12500 },
  { id: 3, name: "HarvestQueen", level: 22, experience: 2200, coins: 11000 },
  // ... add more entries
];

const MOCK_FRIENDS = [
  { id: 1, name: "Alice", level: 18, experience: 1850, coins: 8000 },
  { id: 2, name: "Bob", level: 15, experience: 1520, coins: 6500 },
  { id: 3, name: "Charlie", level: 12, experience: 1250, coins: 5000 },
  // ... add more entries
];

// type LeaderboardEntry = {
//   id: number;
//   name: string;
//   level: number;
//   experience: number;
//   coins: number;
// };

export default function LeaderboardModal() {
  const { toggleLeaderboard } = useGame();
  const { startBackgroundMusic } = useAudio();
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [searchQuery, setSearchQuery] = useState("");

  const currentLeaderboard =
    activeTab === "global" ? MOCK_GLOBAL_LEADERBOARD : MOCK_FRIENDS;

  const filteredLeaderboard = currentLeaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    toggleLeaderboard();
    startBackgroundMusic();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full min-h-screen"
      >
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <motion.h2
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
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
              { id: "friends", label: "Friends", icon: "👥" },
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
                  animate={{ rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0 }}
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

          {/* Search Bar */}
          <div className="relative mb-6">
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
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {filteredLeaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex items-center gap-3
                         border border-[#8B5E3C]/50 shadow-md"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-[#5c4121] rounded-lg text-white/90">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white/90 font-medium">{entry.name}</p>
                    <span className="bg-[#FFB938] text-[#7E4E31] px-2 py-0.5 rounded-full text-xs font-medium">
                      Level {entry.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                    <span>XP: {entry.experience.toLocaleString()}</span>
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
      </motion.div>
    </div>
  );
}
