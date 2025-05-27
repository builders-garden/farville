import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardUserAvatar } from "@/components/leaderboard/LeaderboardUserAvatar";
import { UserCommunityDonationEnhanced } from "@/lib/prisma/types";
import { useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { communityContributionFlexCardComposeCastUrl } from "@/lib/utils";
import { useGame } from "@/context/GameContext";
import sdk from "@farcaster/frame-sdk";
import ProfileModal from "@/components/ProfileModal";

export const ContributionTableSection: React.FC<{
  lastContributions: UserCommunityDonationEnhanced[] | undefined;
  yourContributions: UserCommunityDonationEnhanced[] | undefined;
  isFarcasterManiaOn: boolean;
}> = ({ lastContributions, yourContributions, isFarcasterManiaOn }) => {
  const { state, mode } = useGame();

  const [activeTab, setActiveTab] = useState<"latest" | "yours">("latest");
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const selectedContributions =
    activeTab === "latest" ? lastContributions : yourContributions;

  const handleShare = async (contributionId: string) => {
    const { castUrl } = communityContributionFlexCardComposeCastUrl(
      state.user.fid,
      mode,
      contributionId,
      isFarcasterManiaOn
    );
    await sdk.actions.openUrl(castUrl);
  };

  const handleRowClick = (user: UserCommunityDonationEnhanced) => {
    setSelectedUserFid(user.fid);
  };

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  if (selectedUserFid) {
    return (
      <ProfileModal
        onClose={handleCloseProfile}
        userFid={selectedUserFid}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="w-full bg-[#5C4121]/50 rounded-xl p-4 border border-yellow-400/20">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 xs:gap-2">
          {[
            { id: "latest", icon: "⏰", label: "Latest" },
            { id: "yours", icon: "🙏", label: "Yours" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setActiveTab(tab.id as "latest" | "yours")}
              className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200
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
              <span className="text-[10px] xs:text-xs font-medium">
                {tab.label}
              </span>
            </motion.button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="text-white/70 text-xs">
              <TableHead>Contributor</TableHead>
              <TableHead className="text-right">FP</TableHead>
              {activeTab === "yours" && <TableHead className="w-8"></TableHead>}
            </TableRow>
          </TableHeader>
          {selectedContributions === undefined ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={activeTab === "yours" ? 3 : 2}
                  className="text-center text-white/70"
                >
                  Loading...
                </TableCell>
              </TableRow>
            </TableBody>
          ) : selectedContributions.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={activeTab === "yours" ? 3 : 2}
                  className="text-center text-white/70"
                >
                  No contributions found.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {selectedContributions.map((contribution, index) => (
                <TableRow
                  key={index}
                  className={`${
                    index % 2 === 0
                      ? "bg-[#8B5E3C] hover:bg-[#8B5E3C] hover:bg-opacity-80"
                      : "bg-[#936c4e] hover:bg-[#936c4e] hover:bg-opacity-80"
                  } rounded-lg overflow-hidden mb-4 border border-yellow-400/20 cursor-pointer`}
                  onClick={() => handleRowClick(contribution)}
                >
                  <TableCell className="font-medium first:rounded-l-lg px-3">
                    <div className="flex flex-row items-center gap-3">
                      <LeaderboardUserAvatar
                        pfpUrl={
                          contribution.user.selectedAvatarUrl ||
                          contribution.user.avatarUrl ||
                          ""
                        }
                        username={contribution.user.username}
                        isOgUser={contribution.user.mintedOG}
                        size={{
                          width: 8,
                          height: 8,
                        }}
                      />
                      <div className="flex flex-col justify-center text-white/90 gap-1.5">
                        <span className="text-xs font-semibold leading-none">
                          {contribution.user.username}
                        </span>
                        <span className="text-[10px] font-normal text-white/60 leading-none">
                          {(() => {
                            const timestamp = new Date(
                              contribution.createdAt
                            ).getTime();
                            const now = Date.now();
                            const diff = now - timestamp;

                            if (timestamp <= 0) return "Invalid date";

                            if (diff < 60000) {
                              // less than 1 minute
                              return `${Math.floor(diff / 1000)}s`;
                            } else if (diff < 3600000) {
                              // less than 1 hour
                              return `${Math.floor(diff / 60000)}m`;
                            } else if (diff < 86400000) {
                              // less than 1 day
                              return `${Math.floor(diff / 3600000)}h`;
                            } else {
                              return `${Math.floor(diff / 86400000)}d`;
                            }
                          })()}{" "}
                          ago
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-400 font-semibold last:rounded-r-lg">
                    +{contribution.ptAmount}
                  </TableCell>
                  {activeTab === "yours" && (
                    <TableCell className="text-center">
                      <button
                        className="bg-black/30 border border-white/20 text-white rounded-full p-[0.4em] shadow-md text-xs hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
                        aria-label={`Share contribution of ${contribution.user.username}`}
                        onClick={() => {
                          handleShare(contribution.id);
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
};
