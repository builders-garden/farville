import { DbStreak } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUserStreaks = () => {
  const { data, isLoading, refetch } = useApiQuery<DbStreak[]>({
    queryKey: ["user-streaks"],
    url: "/api/users/me/streaks",
    isProtected: true,
  });

  return { userStreaks: data, isLoading, refetch };
};
