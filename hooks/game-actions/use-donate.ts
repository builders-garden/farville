import { useApiMutation } from "../use-api-mutation";

interface DonateVariables {
  itemId?: number;
  quantity?: number;
  toFid: number;
}

interface DonateResponse {
  success: boolean;
}

export const useDonate = () => {
  const { mutateAsync: donate } = useApiMutation<
    DonateResponse,
    DonateVariables
  >({
    url: (variables) => `/api/items/${variables.itemId}/donate`,
    body: (variables) => ({
      quantity: variables.quantity,
      toFid: variables.toFid,
    }),
  });

  return { donate };
};
