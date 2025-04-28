import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";
import { UserWithStatistic } from "@/lib/prisma/types";

export interface LeaderboardResponse {
  users: (UserWithStatistic & { questCount?: number })[];
  targetPosition?: number;
  questCount?: number;
}

export const useLeaderboard = (
  friends: boolean,
  mode: Mode,
  targetFid?: number,
  quests = false
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  if (friends) queryParams.append("friends", "true");
  if (quests) queryParams.append("type", "quests");
  if (mode) queryParams.append("mode", mode);

  const url = `/api/leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<{
    users: (UserWithStatistic & { questCount?: number })[];
    targetPosition?: number;
    questCount?: number;
  }>({
    url,
    queryKey: ["leaderboard", targetFid, friends, quests, mode],
    isProtected: true,
    enabled: friends ? !!targetFid : true,
    staleTime: 60 * 1000,
  });
};
