import { Card, CardContent } from "../ui/card";
import { useClansLeaderboard } from "@/hooks/use-clans-leaderboard";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal, Users, Zap } from "lucide-react";
import { ClanImage } from "./clan-image";
import ClanDetailModal from "./clan-detail-modal";
import { ClanView } from "./clan-view";
import { useState } from "react";
import { ClanLeaderboardEntry } from "@/hooks/use-clans-leaderboard";

export function ClanSeason() {
  const { data: clans, isLoading } = useClansLeaderboard(10, {
    includeMembers: true,
    includeLeader: true,
  });

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
        return <Crown className="w-4 h-4 xs:w-5 xs:h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-4 h-4 xs:w-5 xs:h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-4 h-4 xs:w-5 xs:h-5 text-amber-600" />;
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
        return "from-[#5B4120]/90 to-[#6B5230]/90 border-[#8B5E3C]/30";
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
            <h2 className="text-sm xs:text-xl font-bold text-amber-200 mb-1 xs:mb-2">
              🌟 Feud Season Leaderboard 🌟
            </h2>
            <p className="text-xs xs:text-sm text-white/80">
              Which feud will dominate this season?
            </p>
          </motion.div>

          {/* Leaderboard */}
          <div className="w-full max-w-2xl space-y-1 xs:space-y-2">
            {clans.map((clan, index) => {
              const position = index + 1;
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
                      ${isTopThree ? "shadow-lg" : ""}`}
                    onClick={() => setSelectedClan(clan)}
                  >
                    <CardContent className="flex items-center justify-between p-2 xs:p-3">
                      {/* Left side: Position, Medal, Clan Info */}
                      <div className="flex items-center gap-2 xs:gap-3 flex-1 min-w-0">
                        {/* Position & Medal */}
                        <div className="flex flex-col items-center gap-0.5 xs:gap-1 min-w-[24px] xs:min-w-[32px]">
                          <div className="text-white/90 font-bold text-sm xs:text-base">
                            #{position}
                          </div>
                          {isTopThree && getMedalIcon(position)}
                        </div>

                        {/* Clan Image */}
                        <ClanImage
                          imageUrl={clan.imageUrl}
                          clanName={clan.name}
                          size="sm"
                        />

                        {/* Clan Details */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-xs xs:text-sm truncate">
                            {clan.name}
                          </h3>
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

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-[10px] xs:text-xs text-white/60 mt-2 xs:mt-4 px-2"
          >
            <p>Leaderboard updates in real-time</p>
            <p>Start farming to boost your feud&apos;s ranking! 🚜</p>
          </motion.div>

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
