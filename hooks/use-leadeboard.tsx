import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useLeaderboard = () => {
  const { data, isLoading, error } = useApiQuery<DbUser[]>({
    url: "/api/leaderboard",
    queryKey: ["leaderboard"],
    isProtected: true,
  });

  return { users: data, isLoading, error };
};
