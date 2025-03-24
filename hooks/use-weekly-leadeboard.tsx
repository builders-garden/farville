import { DbUser, DbUserLeaderboard } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export interface LeaderboardResponse {
  users: (DbUser & { questCount?: number })[];
  targetPosition?: number;
  questCount?: number;
}

export const useWeeklyLeaderboard = (
  targetFid?: number,
  currentWeek?: boolean
) => {
  const queryParams = new URLSearchParams();
  if (targetFid) queryParams.append("targetFid", targetFid.toString());
  if (currentWeek) queryParams.append("currentWeek", currentWeek.toString());

  const url = `/api/weekly-leaderboard${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return useApiQuery<{
    users: DbUserLeaderboard[];
    targetPosition?: number;
  }>({
    url,
    queryKey: ["weekly-leaderboard", targetFid, currentWeek],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });
};
