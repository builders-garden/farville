import { UserLeaderboardEntry } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useWeeklyStats = (mode: Mode, targetFid?: number) => {
  const url = `/api/weekly-leaderboard/${targetFid}?mode=${mode}`;

  const { data, isLoading, refetch } = useApiQuery<UserLeaderboardEntry>({
    url,
    queryKey: ["weekly-leaderboard", targetFid, mode],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userWeeklyStats: data, isLoading, refetch };
};
