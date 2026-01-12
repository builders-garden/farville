"use client";

import { Card, CardContent } from "../ui/card";
import { useClansLeaderboard } from "@/hooks/use-clans-leaderboard";
import { motion } from "framer-motion";
import { Crown, Users, Zap, ArrowLeft } from "lucide-react";
import { ClanImage } from "../clans/clan-image";
import ClanDetailModal from "../clans/clan-detail-modal";
import { ClanView } from "../clans/clan-view";
import { useState } from "react";
import { ClanLeaderboardEntry } from "@/hooks/use-clans-leaderboard";
import { useGame } from "@/context/GameContext";
import { useFrameContext } from "@/context/FrameContext";

// Fixed dates for the archived leaderboard
const FINAL_SEASON_LABEL = "Final Season (Dec 2025 - Jan 2026)";

interface ArchivedFeudsLeaderboardProps {
  onClose: () => void;
}

export default function ArchivedFeudsLeaderboard({
  onClose,
}: ArchivedFeudsLeaderboardProps) {
  const { state } = useGame();
  const { safeAreaInsets } = useFrameContext();
  const userClanId = state.clan?.clanId;

  const [leaderboardType, setLeaderboardType] = useState<"season" | "global">(
    "season"
  );

  const { data: leaderboardData, isLoading } = useClansLeaderboard(20, {
    includeMembers: true,
    includeLeader: true,
    userClanId: userClanId,
    type: leaderboardType,
  });

  const clans = leaderboardData?.clans || [];
  const userClan = leaderboardData?.userClan;

  const [selectedClan, setSelectedClan] = useState<ClanLeaderboardEntry | null>(
    null
  );
  const [isViewingClan, setIsViewingClan] = useState(false);

  // Format XP for display
  const formatXP = (xp: number): string => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(2)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    } else {
      return xp.toString();
    }
  };

  // Get medal icon and color for top 3
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="text-yellow-900 rounded-full">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="text-gray-700 rounded-full">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 3:
        return (
          <div className="text-amber-900 rounded-full">
            <Crown className="w-4 h-4" />
          </div>
        );
      default:
        return null;
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-400/20 to-yellow-600/20 border-yellow-400/50";
      case 2:
        return "from-gray-300/20 to-gray-500/20 border-gray-300/50";
      case 3:
        return "from-amber-600/20 to-amber-800/20 border-amber-600/50";
      default:
        return "from-[#5B4120]/90 to-[#6B5230]/90 border-[#8B5E3C]";
    }
  };

  // Handle viewing a clan in detail
  const handleViewClan = () => {
    setIsViewingClan(true);
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 max-w-md mx-auto bg-[#7E4E31] flex flex-col z-50"
        style={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        <div className="flex items-center gap-2 p-4 border-b border-[#8B5E3C]">
          <button
            onClick={onClose}
            className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                     flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-white/90 font-bold text-lg">Feuds Ranking</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="animate-pulse text-white/70 text-center w-full">
            <div className="h-4 xs:h-6 bg-[#5B4120]/50 rounded w-32 xs:w-48 mb-3 xs:mb-4 mx-auto"></div>
            <div className="space-y-2 xs:space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 xs:h-16 bg-[#5B4120]/50 rounded w-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clans || clans.length === 0) {
    return (
      <div
        className="fixed inset-0 max-w-md mx-auto bg-[#7E4E31] flex flex-col z-50"
        style={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        <div className="flex items-center gap-2 p-4 border-b border-[#8B5E3C]">
          <button
            onClick={onClose}
            className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                     flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-white/90 font-bold text-lg">Feuds Ranking</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <Card className="border-none cursor-pointer bg-[#5B4120]/90 w-full max-w-sm">
            <CardContent className="flex flex-col justify-between items-center p-3 text-center gap-2 xs:gap-3">
              <p className="text-sm xs:text-lg font-bold text-amber-200">
                🌟 Feud Seasons 🌟
              </p>
              <p className="text-xs xs:text-sm text-white/80">
                No feuds found!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 max-w-md mx-auto bg-[#7E4E31] flex flex-col z-50 overflow-hidden"
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}
    >
      {/* Show ClanView if viewing a clan */}
      {selectedClan && isViewingClan ? (
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <ClanView
            clanId={selectedClan.id}
            onClose={() => {
              setIsViewingClan(false);
              setSelectedClan(null);
            }}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 p-4 border-b border-[#8B5E3C]">
            <button
              onClick={onClose}
              className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-white/90 font-bold text-lg flex items-center gap-2">
              🛡️ Feuds Ranking
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Season info */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="w-full"
            >
              <div className="bg-[#3B2F1F]/30 border border-[#8B5E3C]/20 rounded-lg p-2">
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <span className="text-xs">{FINAL_SEASON_LABEL}</span>
                </div>
              </div>
            </motion.div>

            {/* Leaderboard Type Selector */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <div className="grid grid-cols-2 gap-2 bg-[#3B2F1F]/50 p-2 rounded-lg border border-[#8B5E3C]/30">
                {[
                  { id: "season" as const, label: "Season", icon: "🏆" },
                  { id: "global" as const, label: "All Time", icon: "🌟" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setLeaderboardType(tab.id)}
                    className={`px-2 py-1.5 rounded-md flex items-center justify-center gap-1 transition-all duration-200 text-xs font-medium
                      ${
                        leaderboardType === tab.id
                          ? "bg-[#6d4c2c] text-white shadow-lg scale-105"
                          : "text-white/70 hover:bg-[#6d4c2c]/50 hover:text-white"
                      }`}
                    whileHover={{
                      scale: leaderboardType === tab.id ? 1.05 : 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      animate={{
                        rotate: leaderboardType === tab.id ? [0, -5, 5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="text-xs"
                    >
                      {tab.icon}
                    </motion.span>
                    <span className="hidden xs:inline">{tab.label}</span>
                    <span className="xs:hidden">
                      {tab.id === "season" ? "Current" : "All"}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* User's Clan (if exists and not in top 20) */}
            {userClan && userClan.rank > 3 && (
              <div className="w-full mb-2">
                <Card className="border-2 bg-gradient-to-r from-[#5B4120]/90 to-[#6B5230]/90 border-[#8B5E3C] relative overflow-hidden">
                  <CardContent className="flex items-center justify-between p-2">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-effect pointer-events-none"
                      style={{ transform: "translateX(-100%)" }}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative">
                        <ClanImage
                          imageUrl={userClan.imageUrl}
                          clanName={userClan.name}
                          size="md"
                        />
                      </div>
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold text-xs truncate">
                            {userClan.name}
                          </h3>
                          <div className="bg-yellow-500/30 text-white font-bold text-xs px-2 py-0.5 rounded min-w-12 text-center">
                            #{userClan.rank}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] xs:text-xs text-white/70">
                          <div className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                            <span>
                              {userClan.members?.length || 0}/
                              {userClan.maxMembers}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400" />
                            <span className="text-white font-bold">
                              {formatXP(
                                leaderboardType === "season"
                                  ? userClan.seasonXp
                                  : userClan.xp
                              )}
                            </span>
                            <span className="text-white/60">XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Season Leaderboard Label */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-sm font-bold text-amber-200">
                🌟 {leaderboardType === "season" ? "Final Season" : "All Time"}{" "}
                🌟
              </h2>
            </motion.div>

            {/* Leaderboard */}
            <div className="w-full space-y-1 xs:space-y-2 pb-4">
              {clans.map((clan, index) => {
                const position = index + 1;
                const isUserClan = clan.id === userClanId;
                const isTopThree = position <= 3;

                return (
                  <motion.div
                    key={clan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`border-2 bg-gradient-to-r ${getMedalColor(
                        position
                      )} 
                        hover:scale-[1.02] transition-all duration-200 cursor-pointer
                        ${isTopThree ? "shadow-lg" : ""} ${
                        isUserClan ? "relative overflow-hidden" : ""
                      }`}
                      onClick={() => setSelectedClan(clan)}
                    >
                      <CardContent className="flex items-center justify-between p-2">
                        {isUserClan && (
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-effect pointer-events-none"
                            style={{ transform: "translateX(-100%)" }}
                          />
                        )}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="relative">
                            <ClanImage
                              imageUrl={clan.imageUrl}
                              clanName={clan.name}
                              size="md"
                            />
                          </div>
                          <div className="flex flex-col gap-2 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-white font-semibold text-xs truncate">
                                {clan.name}
                              </h3>
                              {isTopThree ? (
                                <div
                                  className={`${
                                    position === 1
                                      ? "bg-yellow-400 text-yellow-900"
                                      : position === 2
                                      ? "bg-gray-300 text-gray-800"
                                      : "bg-amber-600 text-amber-100"
                                  } font-bold text-xs px-1.5 py-0.5 rounded-md flex items-center justify-center min-w-12`}
                                >
                                  {getMedalIcon(position)}
                                </div>
                              ) : (
                                <div className="bg-yellow-500/30 text-white font-bold text-xs px-2 py-0.5 rounded min-w-12 text-center">
                                  #{position}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[10px] xs:text-xs text-white/70">
                              <div className="flex items-center gap-1">
                                <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                                <span>
                                  {clan.members?.length || 0}/{clan.maxMembers}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400" />
                                <span className="text-white font-bold">
                                  {formatXP(
                                    leaderboardType === "season"
                                      ? clan.seasonXp
                                      : clan.xp
                                  )}
                                </span>
                                <span className="text-white/60">XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Clan Detail Modal */}
          {selectedClan && !isViewingClan && (
            <ClanDetailModal
              clan={{
                ...selectedClan,
                memberCount: selectedClan.members?.length || 0,
                level: Math.floor(selectedClan.xp / 1000) + 1,
              }}
              onClose={() => setSelectedClan(null)}
              refetchClans={() => {}}
              onClickView={handleViewClan}
            />
          )}
        </>
      )}
    </div>
  );
}
