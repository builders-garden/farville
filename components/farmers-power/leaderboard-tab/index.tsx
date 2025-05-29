import { motion } from "framer-motion";
import { LeaderboardUserAvatar } from "../../leaderboard/LeaderboardUserAvatar";
import { FloatingShareButton } from "../../FloatingShareButton";
import { DonationsLeaderboardResponse } from "@/hooks/use-donation-leadeboard";

interface LeaderboardEntry {
  fid: number;
  username: string;
  selectedAvatarUrl?: string;
  avatarUrl?: string;
  totalPtAmount: number;
  donationCount: number;
}

interface LeaderboardData {
  targetData?: {
    position: number;
    totalPtAmount: number;
    donationCount: number;
  };
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardTabProps {
  onSelectUser: (fid: number) => void;
  leaderboardData?: DonationsLeaderboardResponse;
  viewerData: {
    fid: number;
    username: string;
    selectedAvatarUrl?: string;
    avatarUrl?: string;
    mintedOG?: boolean;
  };
}

export const LeaderboardTab = ({
  onSelectUser,
  leaderboardData,
  viewerData,
}: LeaderboardTabProps) => {
  const handleShare = async () => {
    // const { castUrl } = leaderboardFlexCardComposeCastUrl(
    //   viewerData.fid,
    //   mode,
    // );
    // await sdk.actions.openUrl(castUrl);
  };

  const transformedLeaderboardData: LeaderboardData | undefined =
    leaderboardData
      ? {
          targetData: leaderboardData.targetData
            ? {
                position: leaderboardData.targetData.position,
                totalPtAmount: leaderboardData.targetData.totalPtAmount,
                donationCount: leaderboardData.targetData.donationCount,
              }
            : undefined,
          leaderboard: leaderboardData.leaderboard.map((entry) => ({
            fid: entry.fid,
            username: entry.username,
            selectedAvatarUrl: entry.selectedAvatarUrl || undefined,
            avatarUrl: entry.avatarUrl || undefined,
            totalPtAmount: entry.totalPtAmount,
            donationCount: entry.donationCount,
          })),
        }
      : undefined;

  return (
    <div className="flex flex-col gap-2 xs:gap-3 w-full">
      {transformedLeaderboardData?.targetData && (
        <motion.div
          key={viewerData.fid}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.02 }}
          className="w-full bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] px-1 xs:px-2 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3
                       border-2 border-[#FFB938] shadow-lg relative overflow-hidden
                       hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
          onClick={() => onSelectUser(viewerData.fid)}
        >
          <div className="flex-none text-center px-1.5 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
            #{transformedLeaderboardData?.targetData.position}
          </div>
          {viewerData.selectedAvatarUrl || viewerData.avatarUrl ? (
            <LeaderboardUserAvatar
              pfpUrl={
                viewerData.selectedAvatarUrl || viewerData.avatarUrl || ""
              }
              username={viewerData.username}
              isOgUser={viewerData.mintedOG}
            />
          ) : (
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
              👤
            </div>
          )}
          <div className="flex flex-col gap-0.5 xs:gap-1 w-full">
            <p className="text-white/90 font-medium truncate text-xs">
              {viewerData.username}
            </p>
            <div className="flex flex-row items-center justify-between w-full">
              <div className="text-[#FFB938] rounded-full font-medium text-xs flex gap-1">
                <span>FP:</span>
                <span>
                  {transformedLeaderboardData?.targetData.totalPtAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-white/60 text-xs flex gap-1">
                <span>Times:</span>
                <span>
                  {transformedLeaderboardData?.targetData.donationCount}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div className="space-y-1.5 xs:space-y-2 w-full">
        {transformedLeaderboardData?.leaderboard.map((entry, index) => (
          <motion.div
            key={entry.fid}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectUser(entry.fid)}
            className={`px-1 xs:px-2 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3 shadow-md cursor-pointer
                        ${
                          entry.fid === viewerData.fid
                            ? "bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] border-2 border-[#FFB938]"
                            : "bg-[#6d4c2c] border border-[#8B5E3C]/50"
                        }`}
          >
            <div className="flex-none text-center px-1.5 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
              #{index + 1}
            </div>
            {entry.selectedAvatarUrl || entry.avatarUrl ? (
              <LeaderboardUserAvatar
                pfpUrl={entry.selectedAvatarUrl || entry.avatarUrl || ""}
                username={entry.username}
              />
            ) : (
              <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                👤
              </div>
            )}
            <div className="flex-1 flex items-center justify-between gap-2 xs:gap-4">
              <div className="flex flex-col gap-0.5 xs:gap-1 w-full">
                <p className="text-white/90 font-medium truncate text-xs">
                  {entry.username}
                </p>
                <div className="flex flex-row justify-between w-full">
                  <div className="text-[#FFB938] rounded-full font-medium text-xs flex gap-1">
                    <span>FP:</span>
                    <span>{entry.totalPtAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-white/60 text-xs flex gap-1">
                    <span>Times:</span>
                    <span>{entry.donationCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <FloatingShareButton onClick={handleShare} />
    </div>
  );
};
