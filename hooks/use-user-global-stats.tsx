import { UserStatistic } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useUserGlobalStats = (targetFid?: number) => {
  const url = targetFid ? `/api/users/${targetFid}/stats` : "";

  const { data, isLoading, refetch } = useApiQuery<Record<Mode, UserStatistic>>(
    {
      url,
      queryKey: ["stats", targetFid],
      isProtected: true,
      enabled: !!targetFid,
      staleTime: 60 * 1000,
    }
  );

  return { userGlobalStats: data, isLoading, refetch };
};
