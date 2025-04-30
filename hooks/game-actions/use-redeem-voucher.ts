import { useGame } from "@/context/GameContext";
import { useApiMutation } from "../use-api-mutation";

interface RedeemVoucherVariables {
  voucherSlug: string;
  toFid: number;
}

interface RedeemVoucherResponse {
  success: boolean;
}

export const useRedeemVoucher = () => {
  const { refetchUserItems } = useGame();

  const { mutateAsync: redeemVoucher } = useApiMutation<
    RedeemVoucherResponse,
    RedeemVoucherVariables
  >({
    url: (variables) =>
      `/api/users/me/vouchers/${variables.voucherSlug}/redeem`,
    onSuccess: () => {
      refetchUserItems();
    },
  });

  return { redeemVoucher };
};
