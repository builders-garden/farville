import { Collectible, UserHasCollectible } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useUserCollectibles = (targetFid?: number) => {
  const url = targetFid ? `/api/users/${targetFid}/collectibles` : "";

  const { data, isLoading, refetch } = useApiQuery<
    (Collectible & { userHasCollectible: UserHasCollectible | null })[]
  >({
    url,
    queryKey: ["collectibles", targetFid],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userCollectibles: data, isLoading, refetch };
};
