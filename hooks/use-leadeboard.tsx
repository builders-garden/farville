import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useLeaderboard = (targetFid?: number) => {
  const { data, isLoading, error } = useApiQuery<{
    users: DbUser[];
    targetPosition?: number;
  }>({
    url: targetFid ? `/api/leaderboard?targetFid=${targetFid}` : "/api/leaderboard",
    queryKey: ["leaderboard", targetFid],
    isProtected: true,
  });

  return { data, isLoading, error };
};
