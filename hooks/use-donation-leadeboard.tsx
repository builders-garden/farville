import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";
import { UserCommunityDonationLeaderboard } from "@/lib/prisma/queries";

export interface DonationsLeaderboardResponse {
  leaderboard: UserCommunityDonationLeaderboard[];
  targetData?: UserCommunityDonationLeaderboard;
}

export const useDonationLeaderboard = (
  mode: Mode,
  targetFid?: number,
  limit?: number,
  enabled = true
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  queryParams.append("mode", mode);
  if (limit) queryParams.append("limit", limit.toString());

  const url = `/api/community/donation/leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<DonationsLeaderboardResponse>({
    url,
    queryKey: ["leaderboard", targetFid, mode],
    isProtected: true,
    enabled: enabled,
    staleTime: 60 * 1000,
  });
};
