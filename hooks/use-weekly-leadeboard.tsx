import { DbUser, DbUserLeaderboard } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useWeeklyLeaderboard = (
  targetFid?: number,
  currentWeek?: boolean,
  league?: number
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  if (currentWeek !== undefined)
    queryParams.append("currentWeek", currentWeek.toString());
  if (league !== undefined) queryParams.append("league", league.toString());

  const url = `/api/weekly-leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data, isLoading, refetch } = useApiQuery<{
    users: (DbUserLeaderboard & {
      user: DbUser;
    })[];
    targetPosition?: number;
  }>({
    url,
    queryKey: ["weekly-leaderboard", targetFid, currentWeek, league],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { weeklyLeaderboard: data, isLoading, refetch };
};
