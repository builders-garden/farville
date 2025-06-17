import { Card, CardContent } from "../ui/card";
import { useClansLeaderboard } from "@/hooks/use-clans-leaderboard";
import { motion } from "framer-motion";
import { Crown, Users, Zap } from "lucide-react";
import { ClanImage } from "./clan-image";
import ClanDetailModal from "./clan-detail-modal";
import { ClanView } from "./clan-view";
import { useState } from "react";
import { ClanLeaderboardEntry } from "@/hooks/use-clans-leaderboard";
import { useGame } from "@/context/GameContext";

export function ClanSeason() {
  const { state } = useGame();
  const userClanId = state.clan?.clanId;

  const { data: leaderboardData, isLoading } = useClansLeaderboard(20, {
    includeMembers: true,
    includeLeader: true,
    userClanId: userClanId,
  });

  const clans = leaderboardData?.clans || [];
  const userClan = leaderboardData?.userClan;

  const [selectedClan, setSelectedClan] = useState<ClanLeaderboardEntry | null>(
    null
  );
  const [isViewingClan, setIsViewingClan] = useState(false);

  // Handle viewing a clan in detail
  const handleViewClan = () => {
    setIsViewingClan(true);
  };

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

  const getMedalColor = (position: number, isUserClan = false) => {
    if (isUserClan) {
      return "from-[#FFB938]/20 to-[#F2A311]/20 border-[#FFB938]/70";
    }

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-start h-full">
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
    );
  }

  if (!clans || clans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-start h-full">
        <Card className="border-none cursor-pointer bg-[#5B4120]/90 w-full max-w-sm">
          <CardContent className="flex flex-col justify-between items-center p-3 text-center gap-2 xs:gap-3">
            <p className="text-sm xs:text-lg font-bold text-amber-200">
              🌟 Feud Seasons 🌟
            </p>
            <p className="text-xs xs:text-sm text-white/80">No feuds found!</p>
            <p className="text-xs xs:text-sm text-white/80">
              Be the first to create a feud and dominate the leaderboard!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start h-full w-full gap-2 xs:gap-4">
      {/* Show ClanView if viewing a clan */}
      {selectedClan && isViewingClan ? (
        <ClanView
          clanId={selectedClan.id}
          onClose={() => {
            setIsViewingClan(false);
            setSelectedClan(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-2"
          >
            <h2 className="text-sm font-bold text-amber-200">
              🌟 Feuds Leaderboard 🌟
            </h2>
          </motion.div>

          {/* User's Clan (if exists and not in top 20) */}
          {userClan && userClan.rank > 20 && (
            <div className="w-full max-w-2xl mb-2">
              <Card className="border-2 bg-gradient-to-r from-[#FFB938]/20 to-[#F2A311]/20 border-[#FFB938]/70">
                <CardContent className="flex items-center justify-between p-2">
                  {/* Left side: Clan Info */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Clan Image */}
                    <div className="relative">
                      <ClanImage
                        imageUrl={userClan.imageUrl}
                        clanName={userClan.name}
                        size="md"
                      />
                    </div>

                    {/* Clan Details */}
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      {/* Clan name and position row */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-xs truncate">
                          {userClan.name}
                        </h3>
                        {/* Position */}
                        <div className="bg-[#FFB938] text-[#7E4E31] font-bold text-xs px-2 py-0.5 rounded min-w-12 text-center">
                          #{userClan.rank}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] xs:text-xs text-white/70">
                        {/* Members count */}
                        <div className="flex items-center gap-1">
                          <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                          <span>
                            {userClan.members?.length || 0}/
                            {userClan.maxMembers}
                          </span>
                        </div>

                        {/* XP */}
                        <div className="flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400" />
                          <span className="text-white font-bold">
                            {formatXP(userClan.xp)}
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
          <div className="w-full max-w-2xl">
            <p className="text-xs text-white/80 text-center">
              Season Leaderboard
            </p>
          </div>

          {/* Leaderboard */}
          <div className="w-full max-w-2xl space-y-1 xs:space-y-2 pb-4">
            {clans.map((clan, index) => {
              const position = index + 1;
              const isUserClan = userClan && clan.id === userClan.id;
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
                      position,
                      isUserClan
                    )} 
                      hover:scale-[1.02] transition-all duration-200 cursor-pointer
                      ${isTopThree ? "shadow-lg" : ""}
                      ${isUserClan ? "ring-2 ring-[#FFB938]/50" : ""}`}
                    onClick={() => setSelectedClan(clan)}
                  >
                    <CardContent className="flex items-center justify-between p-2">
                      {/* Left side: Clan Info */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Clan Image with Medal */}
                        <div className="relative">
                          <ClanImage
                            imageUrl={clan.imageUrl}
                            clanName={clan.name}
                            size="md"
                          />
                        </div>

                        {/* Clan Details */}
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                          {/* Clan name and position row */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold text-xs truncate">
                              {clan.name}
                            </h3>
                            {/* Position - show crown for top 3, number for others */}
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
                            {/* Members count */}
                            <div className="flex items-center gap-1">
                              <Users className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                              <span>
                                {clan.members?.length || 0}/{clan.maxMembers}
                              </span>
                            </div>

                            {/* XP */}
                            <div className="flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-amber-400" />
                              <span className="text-white font-bold">
                                {formatXP(clan.xp)}
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
