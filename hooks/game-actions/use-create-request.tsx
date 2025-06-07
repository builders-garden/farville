import { useApiMutation } from "@/hooks/use-api-mutation";
import { Mode } from "@/lib/types/game";
import sdk from "@farcaster/frame-sdk";

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
      await sdk.haptics.impactOccurred("light");
    },
    onSuccess: async () => {
      await sdk.haptics.notificationOccurred("success");
    },
    isProtected: true,
  });
};
