import { useGame } from "@/context/GameContext";
import { useApiMutation } from "../use-api-mutation";

interface DonateVariables {
  itemId: number | null;
  quantity?: number;
  toFid: number;
  requestId?: string;
}

interface DonateResponse {
  success: boolean;
}

export const useDonate = () => {
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
    onSuccess: () => {
      refetchUserItems();
    },
  });

  return { donate };
};
