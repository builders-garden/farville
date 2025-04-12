import { DbCollectible, DbUserHasCollectible } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUserCollectibles = (targetFid?: number) => {
  const url = `/api/users/${targetFid}/collectibles`;

  const { data, isLoading, refetch } = useApiQuery<
    (DbCollectible & { userHasCollectibles: DbUserHasCollectible | null })[]
  >({
    url,
    queryKey: ["collectibles", targetFid],
    isProtected: true,
    enabled: !!targetFid,
    staleTime: 60 * 1000,
  });

  return { userCollectibles: data, isLoading, refetch };
};
