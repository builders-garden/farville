import { useApiQuery } from "./use-api-query";
import { useGame } from "@/context/GameContext";

type JoinRequestStatus = {
  hasPendingRequest: boolean;
  requestId?: string;
};

// This hook checks if the current user has a pending request to join a specific clan
export const useCheckClanJoinRequest = (clanId: string | undefined) => {
  const { state } = useGame();
  const userFid = state.user?.fid;

  const { data, isLoading } = useApiQuery<JoinRequestStatus>({
    queryKey: ["user-join-request", clanId, userFid],
    url: clanId && userFid ? `/api/clan/${clanId}/check-join-request` : "",
    isProtected: true,
    enabled: !!clanId && !!userFid,
  });

  return {
    hasPendingRequest: data?.hasPendingRequest || false,
    requestId: data?.requestId,
    isLoading,
  };
};
