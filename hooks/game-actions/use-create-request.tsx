import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  hapticsImpactOccurred,
  hapticsNotificationOccurred,
} from "@/lib/farcaster";
import { Mode } from "@/lib/types/game";

interface CreateRequestVariables {
  itemId: number;
  quantity: number;
  mode: Mode;
}

interface CreateRequestResponse {
  id: number;
  fid: number;
  itemId: number;
  quantity: number;
  createdAt: string;
}

export const useCreateRequest = () => {
  return useApiMutation<CreateRequestResponse, CreateRequestVariables>({
    url: "/api/requests",
    method: "POST",
    body: (variables) => ({
      itemId: variables.itemId,
      quantity: variables.quantity,
      mode: variables.mode,
    }),
    onMutate: async () => {
      await hapticsImpactOccurred("light");
    },
    onSuccess: async () => {
      await hapticsNotificationOccurred("success");
    },
    isProtected: true,
  });
};
