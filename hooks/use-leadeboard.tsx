import { User } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export interface LeaderboardResponse {
  users: (User & { questCount?: number })[];
  targetPosition?: number;
  questCount?: number;
}

export const useLeaderboard = (
  friends: boolean,
  targetFid?: number,
  quests = false
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  if (friends) queryParams.append("friends", "true");
  if (quests) queryParams.append("type", "quests");

  const url = `/api/leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<{
    users: (User & { questCount?: number })[];
    targetPosition?: number;
    questCount?: number;
  }>({
    url,
    queryKey: ["leaderboard", targetFid, friends, quests],
    isProtected: true,
    enabled: friends ? !!targetFid : true,
    staleTime: 60 * 1000,
  });
};
