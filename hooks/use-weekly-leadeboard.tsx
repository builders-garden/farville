import { UserLeaderboardEntry } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { UserWithStatistic } from "@/lib/prisma/types";

export const useWeeklyLeaderboard = (
  targetFid?: number,
  currentWeek?: boolean,
  league?: number,
  limit?: number,
  enabled = true
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  if (currentWeek !== undefined)
    queryParams.append("currentWeek", currentWeek.toString());
  if (league !== undefined) queryParams.append("league", league.toString());
  if (limit !== undefined) queryParams.append("limit", limit.toString());

  const url = `/api/weekly-leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const { data, isLoading, refetch } = useApiQuery<{
    users: (UserLeaderboardEntry & {
      user: UserWithStatistic;
    })[];
    targetPosition?: number;
  }>({
    url,
    queryKey: ["weekly-leaderboard", targetFid, currentWeek, league],
    isProtected: true,
    enabled: enabled && !!targetFid,
    staleTime: 60 * 1000,
  });

  return { weeklyLeaderboard: data, isLoading, refetch };
};
