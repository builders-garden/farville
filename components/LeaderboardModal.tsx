"use client";

import { useGame } from "@/context/GameContext";
import { useLeaderboard } from "@/hooks/use-leadeboard";
import {
  getCurrentLevelAndProgress,
  leaderboardFlexCardComposeCastUrl,
  shareWeeklyLeaderboardPositionComposeCastUrl,
  shareWelcomeLeaguesComposeCastUrl,
} from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import { Clock, Info, Share2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useFrameContext } from "../context/FrameContext";
import { LeaderboardUserAvatar } from "./LeaderboardUserAvatar";
import ProfileModal from "./ProfileModal";
import { Card, CardContent } from "./ui/card";
import { useWeeklyLeaderboard } from "@/hooks/use-weekly-leadeboard";
import { DbUser } from "@/supabase/types";
import { OPEN_LEAGUE_LEADERBOARDS } from "@/lib/game-constants";
import InfoModal from "./modals/InfoModal";
import { FloatingShareButton } from "./FloatingShareButton";

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
  const [isShowingCurrentWeek, setIsShowingCurrentWeek] = useState(true);

  const { weeklyLeaderboard: goldWeeklyLeaderboard, refetch: refetchGold } =
    useWeeklyLeaderboard(
      state.weeklyStats.league === 3 ? state?.user.fid : undefined,
      isShowingCurrentWeek,
      3,
      50
    );
  const { weeklyLeaderboard: silverWeeklyLeaderboard, refetch: refetchSilver } =
    useWeeklyLeaderboard(
      state.weeklyStats.league === 2 ? state?.user.fid : undefined,
      isShowingCurrentWeek,
      2,
      50
    );
  const { weeklyLeaderboard: bronzeWeeklyLeaderboard, refetch: refetchBronze } =
    useWeeklyLeaderboard(
      state.weeklyStats.league === 1 ? state?.user.fid : undefined,
      isShowingCurrentWeek,
      1,
      50
    );

  useEffect(() => {
    refetchGold();
    refetchSilver();
    refetchBronze();
  }, [isShowingCurrentWeek, refetchGold, refetchSilver, refetchBronze]);

  const { safeAreaInsets } = useFrameContext();

  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const [timeUntilNextWeek, setTimeUntilNextWeek] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const [isLeagueInfoModalOpen, setIsLeagueInfoModalOpen] = useState(false);
  const [isWhatIsAGtModalOpen, setIsWhatIsAGtModalOpen] = useState(false);

  useEffect(() => {
    const calculateTimeUntilNextWeek = () => {
      const now = new Date();
      const nextWeek = new Date();

      // Get days until next Monday (Monday is 1, Sunday is 0)
      const daysUntilMonday = (8 - now.getUTCDay()) % 7;

      // Set to next Monday at 00:00 UTC
      nextWeek.setUTCDate(now.getUTCDate() + daysUntilMonday);
      nextWeek.setUTCHours(0, 0, 0, 0);

      // If we're past Monday 00:00 UTC, move to next Monday
      if (now > nextWeek) {
        nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
      }

      const diff = nextWeek.getTime() - now.getTime();

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeUntilNextWeek(calculateTimeUntilNextWeek());
    }, 60000); // Update every minute

    // Initial calculation
    setTimeUntilNextWeek(calculateTimeUntilNextWeek());

    return () => clearInterval(timer);
  }, []);

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
      activeTab === "friends"
    );
    await sdk.actions.openUrl(castUrl);
  };

  const handleShareWeeklyLeaderboard = async () => {
    const { castUrl } = shareWeeklyLeaderboardPositionComposeCastUrl(
      state.user.fid,
      state.weeklyStats.league,
      isShowingCurrentWeek
    );
    await sdk.actions.openUrl(castUrl);
  };

  const handleShareWelcomeLeagues = async () => {
    const { castUrl } = shareWelcomeLeaguesComposeCastUrl(
      state.user.fid,
      state.weeklyStats.league
    );
    await sdk.actions.openUrl(castUrl);
  };

  const handleShare = () => {
    if (activeTab === "weekly") {
      handleShareWeeklyLeaderboard();
    } else {
      handleShareLeaderboard();
    }
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
        <>
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
            <div className="max-w-4xl mx-auto w-full h-full p-4 mt-2 flex flex-col gap-2">
              <div className="flex-none">
                <div className="flex justify-between items-center mb-4 xs:mb-6">
                  <div>
                    <motion.h2
                      className="text-white/90 font-bold text-xl xs:text-2xl mb-1 flex items-center gap-2"
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
                        width={20}
                        height={20}
                        className="w-5 h-5 xs:w-6 xs:h-6"
                      />
                      Ranking
                    </motion.h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                             flex items-center justify-center hover:rotate-90 transform duration-200"
                  >
                    ✕
                  </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-1 xs:gap-2 mb-3 xs:mb-4">
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
                      className={`px-2 xs:px-3 py-1 xs:py-2 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200
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
                        <span className="text-[10px] xs:text-xs font-medium">
                          {tab.label}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Secondary tabs for XP/Quests */}
                {activeTab !== "weekly" && (
                  <div className="w-full flex justify-between items-center mb-3 xs:mb-4">
                    <div className="flex gap-2 xs:gap-3">
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
                          className={`px-2 xs:px-3 py-1 rounded-full flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200 text-[10px] xs:text-xs
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
                  </div>
                )}

                {/* Weekly Card summary */}
                {activeTab === "weekly" && (
                  <div className="flex flex-col gap-1 xs:gap-2 mb-2">
                    <div className="flex flex-row justify-between gap-1 xs:gap-2">
                      {[
                        { id: 3, label: "Gold", icon: "🏆" },
                        { id: 2, label: "Iron", icon: "🥈" },
                        { id: 1, label: "Wood", icon: "🥉" },
                      ].map((tab) => (
                        <motion.button
                          key={tab.id}
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setLeagueType(tab.id)}
                          className={`flex-1 px-2 xs:px-3 py-1 rounded-full flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200 text-[10px] xs:text-xs
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
                  </div>
                )}
              </div>

              {/* Scrollable leaderboard list */}
              <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
                {activeTab === "weekly" && (
                  <>
                    <Card className="bg-[#5c4121] text-white/90 border-none mb-2">
                      <CardContent className="flex flex-row items-center gap-2 xs:gap-4 p-2 xs:p-4">
                        <Image
                          src={`/images/leagues/${leagueType}.png`}
                          alt="League"
                          width={48}
                          height={60}
                          className="w-12 h-15 xs:w-16 xs:h-20"
                        />
                        <div className="flex flex-col items-start w-full gap-1 xs:gap-2">
                          <div className="flex flex-row w-full justify-between">
                            <div className="flex flex-col gap-0.5 xs:gap-1 w-full">
                              <p className="text-sm xs:text-md font-bold">
                                {leagueType === 3
                                  ? "Gold"
                                  : leagueType === 2
                                  ? "Iron"
                                  : "Wood"}{" "}
                                League
                              </p>
                              <p className="text-[8px] xs:text-[10px]">
                                {leagueType === 3
                                  ? "level 15+"
                                  : leagueType === 2
                                  ? "level 10-14"
                                  : "level 5-9"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <Info
                                size={16}
                                className="text-white/70 hover:text-white/90 cursor-pointer"
                                onClick={() => setIsLeagueInfoModalOpen(true)}
                              />
                              {isLeagueInfoModalOpen && (
                                <InfoModal
                                  title={`${
                                    leagueType === 3
                                      ? "Gold"
                                      : leagueType === 2
                                      ? "Iron"
                                      : "Wood"
                                  } League`}
                                  onCancel={() =>
                                    setIsLeagueInfoModalOpen(false)
                                  }
                                  icon={`/images/leagues/${leagueType}.png`}
                                >
                                  <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
                                    <p>
                                      Harvest, donate and complete quests ⚔️
                                    </p>
                                    <p>
                                      Compete against other players in your
                                      league to earn rewards every week!
                                    </p>
                                    {leagueType === 3 && (
                                      <>
                                        <div>
                                          The reward for the Gold League is 50
                                          USDC pool divided as follows:
                                          <ul className="list-disc list-inside mt-4 space-y-2">
                                            <li>1st: 8 USDC</li>
                                            <li>2nd: 6 USDC</li>
                                            <li>3rd: 4 USDC</li>
                                            <li>4-10th: 2 USDC</li>
                                            <li>11-25th: 1.25 USDC</li>
                                            <li>26-50th: 0.50 USDC</li>
                                          </ul>
                                        </div>
                                      </>
                                    )}
                                    {leagueType === 2 && (
                                      <div>
                                        The reward for the Iron League are perks
                                        give away as follows:
                                        <ul className="list-disc list-inside mt-4 space-y-2">
                                          <li>1st: 5 fertilizers</li>
                                          <li>2nd: 3 fertilizers</li>
                                          <li>3rd: 25 pumpkin seeds</li>
                                          <li>4-10th: 10 pumpkin seeds</li>
                                          <li>11-25th: 30 phosphorus</li>
                                          <li>26-50th: 25 potassium</li>
                                        </ul>
                                      </div>
                                    )}
                                    {leagueType === 1 && (
                                      <div>
                                        The reward for the Wood League is a
                                        crops give away as follows:
                                        <ul className="list-disc list-inside mt-4 space-y-2">
                                          <li>1st: 20 pumpkin seeds</li>
                                          <li>2nd: 10 pumpkin seeds</li>
                                          <li>3rd: 30 strawberries</li>
                                          <li>4-10th: 20 tomatoes</li>
                                          <li>11-25th: 15 potatoes</li>
                                          <li>26-50th: 15 corns</li>
                                        </ul>
                                      </div>
                                    )}
                                    <p className="mt-4">
                                      Good luck and have fun! <br />
                                      Brum Brum{" "}
                                      <span className="text-xl">🚜💨</span>
                                    </p>
                                  </div>
                                </InfoModal>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-row w-full items-end justify-between">
                            {OPEN_LEAGUE_LEADERBOARDS && (
                              <>
                                <button
                                  className="text-[7px] xs:text-[8px] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full bg-white/10 hover:bg-white/20 
                                         text-white/70 hover:text-white/90 transition-all duration-200
                                         border border-white/20"
                                  onClick={() =>
                                    setIsShowingCurrentWeek(
                                      !isShowingCurrentWeek
                                    )
                                  }
                                >
                                  {isShowingCurrentWeek
                                    ? "Last week"
                                    : "Current week"}
                                </button>
                                <button
                                  className="text-[7px] xs:text-[8px] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full bg-white/10 hover:bg-white/20 
                                      text-white/70 hover:text-white/90 transition-all duration-200
                                      border border-white/20 flex items-center gap-1"
                                  onClick={() => setIsWhatIsAGtModalOpen(true)}
                                >
                                  <div className="flex items-center gap-1">
                                    <span>What&apos;s a </span>
                                    <Image
                                      src="/images/leagues/clover.png"
                                      alt="GT"
                                      width={10}
                                      height={10}
                                      className="w-2.5 h-2.5 xs:w-3 xs:h-3"
                                    />
                                    <span>GT</span>
                                    <span>?</span>
                                  </div>
                                </button>
                                {isWhatIsAGtModalOpen && (
                                  <InfoModal
                                    title="What's a GT?"
                                    onCancel={() =>
                                      setIsWhatIsAGtModalOpen(false)
                                    }
                                    icon={"/images/leagues/clover.png"}
                                  >
                                    <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
                                      <p>
                                        A GT (Green Thumb) is a measure of your
                                        progress in the game during the week.
                                      </p>
                                      <p>
                                        You earn GT by harvesting, donating and
                                        completing quests.
                                      </p>
                                      <p>
                                        The more GT you earn, the higher your
                                        weekly rank will be on the leaderboard!
                                      </p>
                                    </div>
                                  </InfoModal>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="bg-gradient-to-br from-[#8B5c3C] to-[#6d4c2c] rounded-xl p-2 xs:p-3 border border-[#ffa07a]/20 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 xs:gap-2 text-white/80">
                          <Clock
                            size={16}
                            className="text-[#FFB938] w-4 h-4 xs:w-[18px] xs:h-[18px]"
                          />
                          <span className="text-[8px] xs:text-[9px]">
                            Ends in:
                          </span>
                        </div>
                        <div className="flex gap-1 text-white font-bold">
                          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] text-center">
                            {timeUntilNextWeek.days.toString().padStart(2, "0")}
                            <span className="text-[#FFB938] ml-0.5 xs:ml-1">
                              d
                            </span>
                          </div>

                          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] text-center">
                            {timeUntilNextWeek.hours
                              .toString()
                              .padStart(2, "0")}
                            <span className="text-[#FFB938] ml-0.5 xs:ml-1">
                              h
                            </span>
                          </div>

                          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] text-center">
                            {timeUntilNextWeek.minutes
                              .toString()
                              .padStart(2, "0")}
                            <span className="text-[#FFB938] ml-0.5 xs:ml-1">
                              m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {!OPEN_LEAGUE_LEADERBOARDS && activeTab === "weekly" ? (
                  <div className="flex flex-col gap-6 xs:gap-8 items-center justify-center h-full w-full">
                    <p className="text-white/90 text-lg xs:text-xl font-bold">
                      Crop war&apos;s on ⚔️
                    </p>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleShareWelcomeLeagues}
                      className="bg-[#FFB938] w-full justify-center text-[#5c4121] text-xs xs:text-sm px-4 xs:px-6 py-2 xs:py-3 rounded-lg font-bold
                         flex items-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors"
                    >
                      <Share2 size={18} className="w-4 h-4 xs:w-5 xs:h-5" />
                      Let them know
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {getCurrentData()?.targetPosition && (
                      <motion.div
                        key={state.user.fid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.02 }}
                        className="bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] px-3 xs:px-4 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3
                         border-2 border-[#FFB938] shadow-lg mb-3 xs:mb-4 relative overflow-hidden
                         hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                        onClick={() => setSelectedUserFid(state.user.fid)}
                      >
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          animate-[shine_3s_ease-in-out_infinite] pointer-events-none"
                        />
                        <div className="flex-none text-center px-1.5 xs:px-2 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
                          #
                          {getCurrentData()?.targetPosition !== -1
                            ? getCurrentData()?.targetPosition
                            : "N/A"}
                        </div>
                        {state.user.avatarUrl ? (
                          <LeaderboardUserAvatar
                            pfpUrl={state.user.avatarUrl}
                            username={state.user.username}
                            isOgUser={state.user.mintedOG}
                          />
                        ) : (
                          <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                            👤
                          </div>
                        )}
                        <div className="min-w-0 flex flex-col gap-0.5 xs:gap-1 w-full">
                          <p className="text-white/90 font-medium truncate text-xs xs:text-sm">
                            {state.user.username}
                          </p>
                          <div className="flex items-center gap-2 xs:gap-4">
                            {activeTab === "weekly" ||
                            leaderboardType === "xp" ? (
                              <>
                                {activeTab !== "weekly" && (
                                  <span className="text-[#FFB938] rounded-full font-medium text-[10px] xs:text-xs">
                                    Lvl {state.level}
                                  </span>
                                )}
                                <div className="flex justify-between w-full items-center">
                                  <div className="text-white/60 text-[10px] xs:text-xs">
                                    {activeTab === "weekly" ? (
                                      <div className="flex items-center gap-1 xs:gap-2">
                                        <Image
                                          src="/images/leagues/clover.png"
                                          alt="GT"
                                          width={12}
                                          height={12}
                                          className="w-3 h-3 xs:w-[15px] xs:h-[15px]"
                                        />
                                        <>
                                          {isShowingCurrentWeek
                                            ? "GT " +
                                              state.weeklyStats.currentScore.toLocaleString()
                                            : state.weeklyStats.lastScore.toLocaleString()}
                                        </>
                                      </div>
                                    ) : (
                                      <>XP:{state.user.xp.toLocaleString()}</>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <p className="text-white/60 text-[8px] xs:text-[10px]">
                                Completed Quests:{" "}
                                {getCurrentData()?.questCount || 0}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div className="space-y-1.5 xs:space-y-2">
                      {getCurrentData()?.users?.map((entry, index) => (
                        <motion.div
                          key={entry.fid}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedUserFid(entry.fid)}
                          className={`px-3 xs:px-4 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3 shadow-md cursor-pointer
                      ${
                        entry.fid === state.user.fid
                          ? "bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] border-2 border-[#FFB938]"
                          : "bg-[#6d4c2c] border border-[#8B5E3C]/50"
                      }`}
                        >
                          {entry.fid === state.user.fid && (
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          animate-[shine_3s_ease-in-out_infinite] pointer-events-none"
                            />
                          )}
                          <div className="flex-none text-center px-1.5 xs:px-2 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
                            #{index + 1}
                          </div>
                          {entry.avatarUrl ? (
                            <LeaderboardUserAvatar
                              pfpUrl={entry.avatarUrl}
                              username={entry.username}
                              isOgUser={entry.mintedOG}
                            />
                          ) : (
                            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                              👤
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2 xs:gap-4">
                            <div className="min-w-0 flex flex-col gap-0.5 xs:gap-1">
                              <p className="text-white/90 font-medium truncate text-xs xs:text-sm">
                                {entry.username}
                              </p>
                              <div className="flex items-center gap-2 xs:gap-4">
                                {activeTab === "weekly" ||
                                leaderboardType === "xp" ? (
                                  <>
                                    {activeTab !== "weekly" && (
                                      <span className="text-[#FFB938] rounded-full font-medium text-[10px] xs:text-xs">
                                        Lvl{" "}
                                        {
                                          getCurrentLevelAndProgress(entry.xp)
                                            .currentLevel
                                        }
                                      </span>
                                    )}
                                    <div className="text-white/60 text-[10px] xs:text-xs">
                                      {activeTab === "weekly" ? (
                                        <div className="flex items-center gap-1 xs:gap-2">
                                          <Image
                                            src="/images/leagues/clover.png"
                                            alt="GT"
                                            width={12}
                                            height={12}
                                            className="w-3 h-3 xs:w-[15px] xs:h-[15px]"
                                          />
                                          {isShowingCurrentWeek
                                            ? "GT " +
                                              entry.currentScore?.toLocaleString()
                                            : entry.lastScore?.toLocaleString()}
                                        </div>
                                      ) : (
                                        <>XP:{entry.xp.toLocaleString()}</>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-white/60 text-[8px] xs:text-[10px]">
                                    Completed Quests: {entry.questCount || 0}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          {state.level >= 5 && <FloatingShareButton onClick={handleShare} />}
        </>
      )}
    </div>
  );
}
