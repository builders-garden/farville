import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useLeaderboard = (
  friends: boolean,
  targetFid: number,
  quests = false
) => {
  const { data, isLoading, error } = useApiQuery<{
    users: (DbUser & { questCount?: number })[];
    targetPosition?: number;
    questCount?: number;
  }>({
    url: targetFid
      ? `/api/leaderboard?targetFid=${targetFid}&friends=${friends}${
          quests ? "&type=quests" : ""
        }`
      : `/api/leaderboard${quests ? "?type=quests" : ""}`,
    queryKey: ["leaderboard", targetFid, friends, quests],
    isProtected: true,
    enabled: targetFid !== undefined,
  });

  return { data, isLoading, error };
};
