import { useApiMutation } from "../use-api-mutation";
import { toast } from "sonner";

export const useClanOperations = (
  refetchClan?: () => void,
  refetchOutgoingRequests?: () => void
) => {
  const { mutate: _createClan } = useApiMutation({
    url: () => `/api/clan`,
    body: (clanData: {
      name: string;
      motto: string;
      isPublic?: boolean;
      txHash: string; // Now required
      imageUrl?: string;
      requiredLevel?: number;
      paymentId: string;
    }) => clanData,
    method: "POST",
    onSuccess: (data) => {
      if (refetchClan) {
        refetchClan();
      }
      console.log("Clan created successfully:", data);
      toast.success("Clan created successfully!", {
        position: "top-center",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error("Error creating clan:", error);
      toast.error("Failed to create clan", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  // Wrapper function for createClan that supports callbacks
  const createClan = (
    clanData: {
      name: string;
      motto: string;
      isPublic?: boolean;
      txHash: string; // Now required
      imageUrl?: string;
      requiredLevel?: number;
      paymentId: string;
    },
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    _createClan(clanData, {
      onSuccess: () => {
        // Call the callback if provided
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      },
      onError: (error) => {
        // Call the callback if provided
        if (callbacks?.onError) {
          callbacks.onError(error);
        }
      },
    });
  };

  const { mutate: joinClan } = useApiMutation({
    url: () => `/api/clan/join`,
    body: (data: {
      clanId: string;
      isPublic: boolean;
      clanName: string;
      userLevel?: number;
    }) => ({
      clanId: data.clanId,
      isPublic: data.isPublic,
      userLevel: data.userLevel,
    }),
    method: "POST",
    onSuccess: (data, variables) => {
      if (refetchClan) {
        refetchClan();
      }

      // Different toast based on whether the clan is public or private
      if (variables.isPublic) {
        toast.success("You've joined " + variables.clanName + "!", {
          position: "top-center",
          duration: 3000,
        });
      } else {
        toast.success("Join request sent to " + variables.clanName + "!", {
          position: "top-center",
          duration: 3000,
        });

        // Refetch outgoing requests if provided and the clan is private (which creates a request)
        if (!variables.isPublic && refetchOutgoingRequests) {
          refetchOutgoingRequests();
        }
      }

      console.log("Clan join action completed successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error joining clan:", error);
      toast.error("Failed to join clan", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  const { mutate: _leaveClan } = useApiMutation({
    url: () => `/api/clan/join`,
    body: (data?: { successorFid?: number }) =>
      data ? { successorFid: data.successorFid } : undefined,
    method: "DELETE",
    onSuccess: (_, variables) => {
      if (refetchClan) {
        refetchClan();
      }
      const message = variables?.successorFid
        ? "You've left the clan and transferred leadership"
        : "You've left the clan";
      toast.success(message, {
        position: "top-center",
        duration: 3000,
      });
      console.log("Left clan successfully");
    },
    onError: (error: Error) => {
      console.error("Error leaving clan:", error);
      toast.error("Failed to leave clan", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  // Wrapper function for leaveClan that supports callbacks and successor selection
  const leaveClan = (
    data?: { successorFid?: number },
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    _leaveClan(data, {
      onSuccess: () => {
        // Call the callback if provided
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      },
      onError: (error) => {
        // Call the callback if provided
        if (callbacks?.onError) {
          callbacks.onError(error);
        }
      },
    });
  };

  const { mutate: _updateClan } = useApiMutation({
    url: () => `/api/clan`,
    body: (clanData: {
      clanId: string;
      motto?: string;
      isPublic?: boolean;
      imageUrl?: string;
      requiredLevel?: number | null;
    }) => clanData,
    method: "PATCH",
    onSuccess: (data) => {
      // Don't automatically refetch here - let the calling component handle it
      console.log("Clan updated successfully:", data);
      toast.success("Clan updated successfully!", {
        position: "top-center",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      console.error("Error updating clan:", error);
      toast.error("Failed to update clan", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  // Wrapper function for updateClan that supports callbacks
  const updateClan = (
    clanData: {
      clanId: string;
      motto?: string;
      isPublic?: boolean;
      imageUrl?: string;
      requiredLevel?: number | null;
    },
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    _updateClan(clanData, {
      onSuccess: () => {
        // Call the callback if provided
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      },
      onError: (error) => {
        // Call the callback if provided
        if (callbacks?.onError) {
          callbacks.onError(error);
        }
      },
    });
  };

  const { mutate: _manageMember } = useApiMutation({
    url: (data: { fid: number }) => `/api/clan/members/${data.fid}`,
    body: (data: {
      fid: number;
      action: "promote" | "demote" | "kick" | "promote_to_leader";
      clanId: string;
    }) => ({
      action: data.action,
      clanId: data.clanId,
    }),
    method: "PATCH",
    onSuccess: (data, variables) => {
      if (refetchClan) {
        refetchClan();
      }
      const actionText =
        variables.action === "promote"
          ? "promoted"
          : variables.action === "demote"
          ? "demoted"
          : variables.action === "promote_to_leader"
          ? "promoted to leader"
          : "kicked";
      toast.success(`Member ${actionText} successfully!`, {
        position: "top-center",
        duration: 3000,
      });
      console.log("Member action completed successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error managing member:", error);
      toast.error("Failed to perform member action", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  // Wrapper function for manageMember that supports callbacks
  const manageMember = (
    data: {
      fid: number;
      action: "promote" | "demote" | "kick" | "promote_to_leader";
      clanId: string;
    },
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    _manageMember(data, {
      onSuccess: () => {
        // Call the callback if provided
        if (callbacks?.onSuccess) {
          callbacks.onSuccess();
        }
      },
      onError: (error) => {
        // Call the callback if provided
        if (callbacks?.onError) {
          callbacks.onError(error);
        }
      },
    });
  };

  const { mutate: shareRequestToClan } = useApiMutation({
    url: () => `/api/clan/request`,
    body: (data: {
      requestId?: string;
      clanId: string;
      itemId?: number;
      quantity?: number;
    }) => ({
      requestId: data.requestId,
      clanId: data.clanId,
      itemId: data.itemId,
      quantity: data.quantity,
    }),
    method: "POST",
    onSuccess: (data) => {
      toast.success("Request shared to clan successfully!", {
        position: "top-center",
        duration: 3000,
      });
      console.log("Request shared to clan successfully:", data);
    },
    onError: (error: Error) => {
      console.error("Error sharing request to clan:", error);
      toast.error("Failed to share request to clan", {
        position: "top-center",
        duration: 3000,
      });
    },
  });

  return {
    createClan,
    joinClan,
    leaveClan,
    updateClan,
    manageMember,
    shareRequestToClan,
  };
};
