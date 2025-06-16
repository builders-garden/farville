import { useGame } from "@/context/GameContext";
import { useApiMutation } from "../use-api-mutation";
import {
  hapticsImpactOccurred,
  hapticsNotificationOccurred,
} from "@/lib/farcaster";

interface DonateVariables {
  itemId: number | null;
  quantity?: number;
  toFid: number;
  requestId?: string;
}

interface DonateResponse {
  success: boolean;
}

export const useDonate = (onSuccess?: () => void) => {
  const { refetchUserItems } = useGame();

  const { mutateAsync: donate } = useApiMutation<
    DonateResponse,
    DonateVariables
  >({
    url: (variables) => `/api/items/${variables.itemId}/donate`,
    body: (variables) => ({
      quantity: variables.quantity,
      toFid: variables.toFid,
      requestId: variables.requestId,
    }),
    onMutate: async () => {
      await hapticsImpactOccurred("light");
    },
    onSuccess: async () => {
      await hapticsNotificationOccurred("success");
      refetchUserItems();
      // Call the optional onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  return { donate };
};
