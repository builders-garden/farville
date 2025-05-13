import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useUserModes = (targetFid?: number) => {
  const url = targetFid ? `/api/users/${targetFid}/modes` : "";

  const { data, isLoading, refetch } = useApiQuery<Mode[]>({
    url,
    queryKey: ["modes", targetFid],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userModes: data, isLoading, refetch };
};
