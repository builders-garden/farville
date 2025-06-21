import { useApiQuery } from "./use-api-query";
import { ClanWithData } from "@/lib/prisma/types";

export const useUserClanRequests = (clanId?: string, userFid?: number) => {
  const { data, isLoading, refetch } = useApiQuery<ClanWithData>({
    queryKey: ["clan-requests", clanId],
    url: `/api/clan/${clanId}`,
    isProtected: true,
    enabled: !!clanId,
  });

  // Calculate if there are unfulfilled requests (excluding the user's own requests)
  const hasUnfulfilledRequests =
    data?.requests?.some((request) => {
      // Skip the user's own requests
      if (request.fid === userFid) {
        return false;
      }

      if (request.request) {
        return request.request.filledQuantity < request.request.quantity;
      }
      return false;
    }) || false;

  return {
    clanData: data,
    isLoading,
    refetch,
    hasUnfulfilledRequests,
  };
};
