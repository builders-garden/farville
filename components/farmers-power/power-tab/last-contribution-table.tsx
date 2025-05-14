import { useGame } from "@/context/GameContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommunityDonation } from "@/hooks/use-community-donation";
import { LeaderboardUserAvatar } from "@/components/leaderboard/LeaderboardUserAvatar";

export const LastContributionTable = () => {
  const { mode } = useGame();

  const { data: lastContributions } = useCommunityDonation(mode, true);

  return (
    <div className="w-full bg-[#5C4121]/50 rounded-xl p-4 border border-yellow-400/20">
      <h3 className="text-white/90 text-md font-bold mb-4">
        Last Contributions
      </h3>

      <Table>
        <TableHeader>
          <TableRow className="text-white/70">
            <TableHead>Farmer</TableHead>
            <TableHead className="text-right">FP</TableHead>
          </TableRow>
        </TableHeader>
        {lastContributions === undefined ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="text-center text-white/70">
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {lastContributions.map((contribution, index) => (
              <TableRow
                key={index}
                className={`hover:bg-[#8B5E3C]/20 ${
                  index % 2 === 0 ? "bg-[#8B5E3C]" : "bg-[#936c4e]"
                } rounded-lg overflow-hidden mb-4 border border-yellow-400/20`}
              >
                <TableCell className="font-medium first:rounded-l-lg">
                  <div className="flex flex-row items-center gap-2">
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
                    <div className="flex flex-col justify-center text-white/90">
                      <span className="text-xs font-semibold">
                        {contribution.user.username}
                      </span>
                      <span className="text-[10px] font-normal text-white/60">
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
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
};
