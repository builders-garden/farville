"use client";

import { useGame } from "@/context/GameContext";
import { useLeaderboard } from "@/hooks/use-leadeboard";
import {
  getCurrentLevelAndProgress,
  leaderboardFlexCardComposeCastUrl,
} from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useFrameContext } from "../context/FrameContext";
import { LeaderboardUserAvatar } from "./LeaderboardUserAvatar";
import ProfileModal from "./ProfileModal";
import { Card, CardContent } from "./ui/card";
import { useWeeklyLeaderboard } from "@/hooks/use-weekly-leadeboard";
import { DbUser } from "@/supabase/types";

const shimmerAnimation = `
  @keyframes shine {
    0% { transform: translateX(-100%); }
    50%, 100% { transform: translateX(100%); }
  }
  @keyframes diamondShine {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes diamondPulse {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.05); opacity: 1; }
  }
`;

export default function LeaderboardModal({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const { data: globalData } = useLeaderboard(false, state?.user.fid);
  const { data: friendsData } = useLeaderboard(true, state?.user.fid);
  const { data: questsData } = useLeaderboard(false, state?.user.fid, true);
  const { data: questsFriendsData } = useLeaderboard(
    true,
    state?.user.fid,
    true
  );
  const [activeTab, setActiveTab] = useState<"global" | "friends" | "weekly">(
    "weekly"
  );
  const [leaderboardType, setLeaderboardType] = useState<"xp" | "quests">("xp");
  const [leagueType, setLeagueType] = useState<number>(
    state.weeklyStats.league || 3
  );
  const { weeklyLeaderboard: goldWeeklyLeaderboard } = useWeeklyLeaderboard(
    state.weeklyStats.league === 3 ? state?.user.fid : undefined,
    true,
    3
  );
  const { weeklyLeaderboard: silverWeeklyLeaderboard } = useWeeklyLeaderboard(
    state.weeklyStats.league === 2 ? state?.user.fid : undefined,
    true,
    2
  );
  const { weeklyLeaderboard: bronzeWeeklyLeaderboard } = useWeeklyLeaderboard(
    state.weeklyStats.league === 1 ? state?.user.fid : undefined,
    true,
    1
  );
  const { safeAreaInsets } = useFrameContext();

  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const handleClose = () => {
    onClose();
  };

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  const handleShareLeaderboard = async () => {
    const { castUrl } = leaderboardFlexCardComposeCastUrl(
      state.user.fid,
      leaderboardType,
      activeTab === "friends",
      activeTab === "friends"
        ? leaderboardType === "xp"
          ? friendsData
          : questsFriendsData
        : undefined
    );
    await sdk.actions.openUrl(castUrl);
  };

  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.textContent = shimmerAnimation;
    document.head.appendChild(style);
  }

  type LeaderboardData = {
    targetPosition?: number;
    users?: (DbUser & {
      currentScore?: number;
      lastScore?: number;
      league?: number;
      questCount?: number;
    })[];
    questCount?: number;
  };

  // Helper to get current data based on active tabs
  const getCurrentData = (): LeaderboardData | undefined => {
    if (activeTab === "weekly") {
      const weeklyLeaderboard =
        leagueType === 3
          ? goldWeeklyLeaderboard
          : leagueType === 2
          ? silverWeeklyLeaderboard
          : bronzeWeeklyLeaderboard;
      return {
        targetPosition: weeklyLeaderboard?.targetPosition,
        users: weeklyLeaderboard?.users.map((user) => ({
          ...user.user,
          ...user,
          questCount: undefined,
        })),
        questCount: undefined,
      };
    }
    if (leaderboardType === "xp") {
      return activeTab === "global" ? globalData : friendsData;
    }
    return activeTab === "global" ? questsData : questsFriendsData;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {selectedUserFid ? (
        <ProfileModal onClose={handleCloseProfile} userFid={selectedUserFid} />
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
                    <Image
                      src="/images/icons/experience.png"
                      alt="Leaderboard"
                      width={24}
                      height={24}
                    />
                    Ranking
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
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: "weekly", label: "Weekly", icon: "🏆" },
                  { id: "global", label: "Global", icon: "🌍" },
                  { id: "friends", label: "Friends", icon: "👥" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() =>
                      setActiveTab(tab.id as "global" | "friends" | "weekly")
                    }
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
                      className="mb-1"
                    >
                      {tab.icon}
                    </motion.span>
                    {activeTab === tab.id && (
                      <span className="text-xs font-medium">{tab.label}</span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab Title */}
              {/* <h3 className="text-white/90 font-bold text-lg mb-4">
                {activeTab === "weekly"
                  ? "Weekly Leaders"
                  : activeTab === "global"
                  ? "Global Leaders"
                  : "Friends Leaders"}
              </h3> */}

              {/* Secondary tabs for XP/Quests */}
              {activeTab !== "weekly" && (
                <div className="w-full flex justify-between items-center mb-4">
                  <div className="flex gap-3">
                    {[
                      { id: "xp", label: "XP", icon: "⭐" },
                      { id: "quests", label: "Quests", icon: "🎯" },
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() =>
                          setLeaderboardType(tab.id as "xp" | "quests")
                        }
                        className={`px-3 py-1 rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 text-xs
                        ${
                          leaderboardType === tab.id
                            ? "bg-[#FFB938] text-[#5c4121] font-semibold shadow-md"
                            : "text-white/70 hover:bg-white/10 border border-white/20"
                        }`}
                        whileHover={{
                          scale: leaderboardType === tab.id ? 1.05 : 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span
                          animate={{
                            rotate:
                              leaderboardType === tab.id ? [0, -5, 5, 0] : 0,
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                          className="text-sm mb-1"
                        >
                          {tab.icon}
                        </motion.span>
                        <span>{tab.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full flex items-center justify-center 
                    bg-[#6d4c2c] text-white/70 border border-white/20 hover:bg-[#8B5E3C]
                    transition-all duration-200"
                    onClick={handleShareLeaderboard}
                  >
                    <Share2 size={14} />
                  </motion.button>
                </div>
              )}

              {/* Weekly Card summary */}
              {activeTab === "weekly" && (
                <>
                  <div className="flex flex-row justify-between my-2">
                    {[
                      { id: 3, label: "Gold", icon: "🏆" },
                      { id: 2, label: "Silver", icon: "🥈" },
                      { id: 1, label: "Bronze", icon: "🥉" },
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setLeagueType(tab.id)}
                        className={`px-3 py-1 rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 text-xs
                        ${
                          leagueType === tab.id
                            ? "bg-[#FFB938] text-[#5c4121] font-semibold shadow-md"
                            : "text-white/70 hover:bg-white/10 border border-white/20"
                        }`}
                        whileHover={{
                          scale: leagueType === tab.id ? 1.05 : 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.span
                          animate={{
                            rotate: leagueType === tab.id ? [0, -5, 5, 0] : 0,
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                          className="text-sm mb-1"
                        >
                          {tab.icon}
                        </motion.span>
                        <span>{tab.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <Card className="bg-[#5c4121] text-white/90 mb-4 border-none">
                    <CardContent className="flex flex-row items-center gap-4 p-4">
                      <div className="text-6xl w-[60px]">🏆</div>
                      <div className="flex flex-col items-start w-full gap-2">
                        <div className="flex flex-row w-full justify-between">
                          <div className="flex flex-col gap-1 w-full">
                            <p className="text-md font-bold">
                              {leagueType === 3
                                ? "Gold"
                                : leagueType === 2
                                ? "Silver"
                                : "Bronze"}{" "}
                              League
                            </p>
                            <p className="text-[10px]">
                              {leagueType === 3
                                ? "level 15+"
                                : leagueType === 2
                                ? "level 10-14"
                                : "level 5-9"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-md font-bold">50$</p>
                            <p className="text-[10px]">prize</p>
                          </div>
                        </div>
                        <p className="text-[8px] text-white/60">
                          Ends in: 3d 4h
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Scrollable leaderboard list */}
            <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
              {getCurrentData()?.targetPosition && (
                <motion.div
                  key={state.user.fid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.02 }}
                  className="bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] px-4 py-3 rounded-lg flex items-center gap-3
                           border-2 border-[#FFB938] shadow-lg mb-4 relative overflow-hidden
                           hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                  onClick={() => setSelectedUserFid(state.user.fid)}
                >
                  {/* Add subtle shine effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                  animate-[shine_3s_ease-in-out_infinite] pointer-events-none"
                  />

                  {/* Rank */}
                  <div className="flex-none text-center px-2 py-1 bg-[#5c4121] rounded-lg text-white/90 text-xs font-medium">
                    #{getCurrentData()?.targetPosition}
                  </div>

                  {/* Avatar */}
                  {state.user.avatarUrl ? (
                    <LeaderboardUserAvatar
                      pfpUrl={state.user.avatarUrl}
                      username={state.user.username}
                      isOgUser={state.user.mintedOG}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                      👤
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    {/* Username and XP */}
                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="text-white/90 font-medium truncate text-sm">
                        {state.user.username}
                      </p>
                      <div className="flex items-center gap-4">
                        {leaderboardType === "xp" ? (
                          <>
                            <span className="text-[#FFB938] rounded-full font-medium text-xs">
                              Lvl {state.level}
                            </span>
                            <p className="text-white/60 text-xs">
                              {activeTab === "weekly" ? (
                                <>GT:{state.weeklyStats.currentScore}</>
                              ) : (
                                <>XP:{state.user.xp.toLocaleString()}</>
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-white/60 text-[10px]">
                            Completed Quests:{" "}
                            {getCurrentData()?.questCount || 0}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="space-y-2">
                {getCurrentData()?.users?.map((entry, index) => (
                  <motion.div
                    key={entry.fid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedUserFid(entry.fid)}
                    className={`px-4 py-3 rounded-lg flex items-center gap-3 shadow-md cursor-pointer
                        ${
                          entry.fid === state.user.fid
                            ? "bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] border-2 border-[#FFB938]"
                            : "bg-[#6d4c2c] border border-[#8B5E3C]/50"
                        }`}
                  >
                    {/* Add shine effect for current user */}
                    {entry.fid === state.user.fid && (
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                    animate-[shine_3s_ease-in-out_infinite] pointer-events-none"
                      />
                    )}

                    {/* Rank */}
                    <div className="flex-none text-center px-2 py-1 bg-[#5c4121] rounded-lg text-white/90 text-xs font-medium">
                      #{index + 1}
                    </div>

                    {/* Avatar */}
                    {entry.avatarUrl ? (
                      <LeaderboardUserAvatar
                        pfpUrl={entry.avatarUrl}
                        username={entry.username}
                        isOgUser={entry.mintedOG}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                        👤
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                      {/* Username and XP */}
                      <div className="min-w-0 flex flex-col gap-1">
                        <p className="text-white/90 font-medium truncate text-sm">
                          {entry.username}
                        </p>
                        <div className="flex items-center gap-4">
                          {leaderboardType === "xp" ? (
                            <>
                              <span className="text-[#FFB938] rounded-full font-medium text-xs">
                                Lvl{" "}
                                {
                                  getCurrentLevelAndProgress(entry.xp)
                                    .currentLevel
                                }
                              </span>
                              <p className="text-white/60 text-xs">
                                {activeTab === "weekly" ? (
                                  <>GT:{entry.currentScore?.toLocaleString()}</>
                                ) : (
                                  <>XP:{entry.xp.toLocaleString()}</>
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-white/60 text-[10px]">
                              Completed Quests: {entry.questCount || 0}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
