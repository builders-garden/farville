import { UserLeaderboardEntry } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useWeeklyStats = (targetFid?: number) => {
  const url = `/api/weekly-leaderboard/${targetFid}`;

  const { data, isLoading, refetch } = useApiQuery<UserLeaderboardEntry>({
    url,
    queryKey: ["weekly-leaderboard", targetFid],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userWeeklyStats: data, isLoading, refetch };
};
