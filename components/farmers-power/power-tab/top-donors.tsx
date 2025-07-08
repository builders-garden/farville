import { LeaderboardUserAvatar } from "@/components/leaderboard/LeaderboardUserAvatar";
import { useGame } from "@/context/GameContext";
import { communityBoosterTopDonorsFlexCardComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "motion/react";

interface TopDonorsProps {
  setActiveTab: (tab: "power" | "leaderboard") => void;
  topDonors: {
    fid: number;
    username: string;
    avatarUrl?: string;
    selectedAvatarUrl?: string;
    mintedOG?: boolean;
  }[];
  isLoadingDonors: boolean;
  onSelectUser: (fid: number) => void;
  viewerData: {
    fid: number;
  };
}

export const TopDonors = ({
  setActiveTab,
  topDonors,
  onSelectUser,
  isLoadingDonors,
  viewerData,
}: TopDonorsProps) => {
  const { mode } = useGame();

  const handleShare = async () => {
    const { castUrl } = communityBoosterTopDonorsFlexCardComposeCastUrl(
      viewerData.fid,
      mode,
      topDonors.map((donor) => donor.username),
      false
    );
    await sdk.actions.openUrl(castUrl);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-[#5C4121]/50 rounded-lg p-4 border border-yellow-400/20">
      <div className="text-white text-center font-semibold text-xs">
        Top Contributors
      </div>
      <div className="grid grid-cols-5 gap-2 place-items-center">
        {isLoadingDonors
          ? Array.from({ length: 5 }).map((_, index) => (
              <motion.div
                key={index}
                className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"
              />
            ))
          : topDonors.map((donor, index) => (
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                key={donor.fid}
                onClick={() => onSelectUser(donor.fid)}
                className={`relative ${
                  index === 0
                    ? "ring-4 ring-yellow-400"
                    : index === 1
                    ? "ring-4 ring-gray-300"
                    : index === 2
                    ? "ring-4 ring-[#CD7F32]"
                    : "ring-4 ring-white/30"
                } rounded-full cursor-pointer`}
              >
                {/* Aura effect behind each donor avatar with random scale animation */}
                <motion.span
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    boxShadow:
                      index === 0
                        ? "0 0 12px 6px rgba(251, 191, 36, 0.5), 0 0 24px 12px rgba(251, 191, 36, 0.2)"
                        : index === 1
                        ? "0 0 12px 6px rgba(209, 213, 219, 0.5), 0 0 24px 12px rgba(209, 213, 219, 0.2)"
                        : index === 2
                        ? "0 0 12px 6px rgba(205, 127, 50, 0.5), 0 0 24px 12px rgba(205, 127, 50, 0.2)"
                        : "0 0 8px 4px rgba(153, 153, 153, 0.25), 0 0 16px 8px rgba(111, 111, 111, 0.1)",
                  }}
                  animate={{
                    scale: [1, Math.random() * 0.3 + 0.9, 1],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <LeaderboardUserAvatar
                  pfpUrl={donor.selectedAvatarUrl || donor.avatarUrl || ""}
                  username={donor.username}
                  isOgUser={donor.mintedOG}
                  borderSize={0}
                />
              </motion.div>
            ))}
      </div>
      <div className="grid grid-cols-2 gap-1 xs:gap-2 text-white mt-2">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleShare()}
          className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200 bg-pink-500/30 hover:bg-pink-500/50`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoadingDonors || topDonors.length === 0}
        >
          <motion.span
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="mb-1"
          >
            💜
          </motion.span>
          <span className="text-[10px] xs:text-xs font-medium">Show love</span>
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab("leaderboard")}
          className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200 bg-blue-500/30 hover:bg-blue-500/50`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoadingDonors || topDonors.length === 0}
        >
          <motion.span
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="mb-1"
          >
            🫂
          </motion.span>
          <span className="text-[10px] xs:text-xs font-medium">View all</span>
        </motion.button>
      </div>
    </div>
  );
};
