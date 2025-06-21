import { useApiQuery } from "./use-api-query";
import { ClanWithData } from "@/lib/prisma/types";

export const useUserClanRequests = (clanId?: string) => {
  const { data, isLoading, refetch } = useApiQuery<ClanWithData>({
    queryKey: ["clan-requests", clanId],
    url: `/api/clan/${clanId}`,
    isProtected: true,
    enabled: !!clanId,
  });

  // Calculate if there are unfulfilled requests
  const hasUnfulfilledRequests =
    data?.requests?.some((request) => {
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
