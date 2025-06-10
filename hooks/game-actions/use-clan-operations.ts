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
    body: (data: { clanId: string; isPublic: boolean; clanName: string }) => ({
      clanId: data.clanId,
      isPublic: data.isPublic,
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

  return {
    createClan,
    joinClan,
  };
};
