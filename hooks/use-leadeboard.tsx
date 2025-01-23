import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useLeaderboard = (friends: boolean, targetFid: number) => {
  const { data, isLoading, error } = useApiQuery<{
    users: DbUser[];
    targetPosition?: number;
  }>({
    url: targetFid
      ? `/api/leaderboard?targetFid=${targetFid}&friends=${friends}`
      : "/api/leaderboard",
    queryKey: ["leaderboard", targetFid, friends],
    isProtected: true,
    enabled: targetFid !== undefined,
  });

  return { data, isLoading, error };
};
