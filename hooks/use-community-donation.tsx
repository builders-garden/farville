import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";
import { UserCommunityDonationLeaderboard } from "@/lib/prisma/queries";

export interface DonationsLeaderboardResponse {
  leaderboard: UserCommunityDonationLeaderboard[];
}

export const useCommunityDonation = (mode: Mode, enabled = true) => {
  const queryParams = new URLSearchParams();
  queryParams.append("mode", mode);

  const url = `/api/user-community-donation${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<DonationsLeaderboardResponse>({
    url,
    queryKey: ["community-donations", mode],
    isProtected: true,
    enabled: enabled,
    staleTime: 60 * 1000,
  });
};
