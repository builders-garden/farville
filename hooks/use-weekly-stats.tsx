import { DbUserLeaderboard } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useWeeklyStats = (targetFid?: number) => {
  const url = `/api/weekly-leaderboard/${targetFid}`;

  const { data, isLoading, refetch } = useApiQuery<DbUserLeaderboard>({
    url,
    queryKey: ["weekly-leaderboard", targetFid],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userWeeklyStats: data, isLoading, refetch };
};
