import { useApiMutation } from "../use-api-mutation";
import { toast } from "sonner";

export const useClanOperations = (
  refetchClan: () => void,
  refetchOutgoingRequests?: () => void
) => {
  const { mutate: _createClan } = useApiMutation({
    url: () => `/api/clan`,
    body: (clanData: {
      name: string;
      motto: string;
      isPublic?: boolean;
      txHash?: string;
      requiredLevel?: number;
    }) => clanData,
    method: "POST",
    onSuccess: (data) => {
      refetchClan();
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
      txHash?: string;
      imageUrl?: string;
      requiredLevel?: number;
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
      refetchClan();

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
    method: "DELETE",
    onSuccess: () => {
      refetchClan();
      toast.success("You've left the clan", {
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

  // Wrapper function for leaveClan that supports callbacks
  const leaveClan = (
    _?: unknown, // Not used but kept for consistency with other functions
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    _leaveClan(undefined, {
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

  return {
    createClan,
    joinClan,
    leaveClan,
  };
};
