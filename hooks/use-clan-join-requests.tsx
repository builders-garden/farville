import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";
import { toast } from "sonner";

type ClanJoinRequest = {
  id: string;
  clanId: string;
  fid: number;
  createdAt: string;
  user: {
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

export const useClanJoinRequests = (clanId?: string) => {
  const { data, isLoading, refetch } = useApiQuery<ClanJoinRequest[]>({
    queryKey: ["clan-join-requests", clanId],
    url: clanId ? `/api/clan/${clanId}/join-requests` : "",
    isProtected: true,
    enabled: !!clanId,
  });

  const { mutate: respondToJoinRequest, isPending } = useApiMutation<
    unknown,
    {
      clanId: string;
      requestId: string;
      action: "accept" | "reject";
      onActionComplete?: () => void;
      refetchMembers?: () => void;
    }
  >({
    url: (data) => `/api/clan/${data.clanId}/join-requests`,
    body: (data) => ({ requestId: data.requestId, action: data.action }),
    method: "POST",
    onSuccess: (_, variables) => {
      // Show the toast notification only after the operation completes successfully
      toast.success(
        variables.action === "accept"
          ? "User was accepted to the clan"
          : "Request was rejected"
      );

      // Refetch join requests
      refetch();

      // If accept action, also refetch members to update the member list
      if (variables.action === "accept" && variables.refetchMembers) {
        variables.refetchMembers();
      }

      // Call onActionComplete callback if provided
      if (variables.onActionComplete) {
        variables.onActionComplete();
      }
    },
    onError: (error, variables) => {
      console.error(
        `Error ${
          variables.action === "accept" ? "accepting" : "rejecting"
        } request:`,
        error
      );
      toast.error(
        variables.action === "accept"
          ? "Failed to accept user"
          : "Failed to reject request"
      );

      // Call onActionComplete callback even on error
      if (variables.onActionComplete) {
        variables.onActionComplete();
      }
    },
  });

  return {
    requests: data || [],
    isLoading,
    refetch,
    isPending,
    respondToJoinRequest: (
      requestId: string,
      action: "accept" | "reject",
      onActionComplete?: () => void,
      refetchMembers?: () => void
    ) => {
      if (clanId) {
        respondToJoinRequest({
          clanId,
          requestId,
          action,
          onActionComplete,
          refetchMembers,
        });
      }
    },
  };
};
