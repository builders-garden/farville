import { useGame } from "@/context/GameContext";
import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Mode } from "@/lib/types/game";

interface RedeemVoucherVariables {
  voucherSlug: string;
  mode: Mode;
}

interface RedeemVoucherResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const useRedeemVoucher = ({
  isActionInProgress,
  setIsActionInProgress,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { refetchUserItems } = useGame();
  const { playSound } = useAudio();

  return useApiMutation<RedeemVoucherResponse, RedeemVoucherVariables>({
    url: ({ voucherSlug }) => `/api/users/me/vouchers/${voucherSlug}/redeem`,
    body: ({ mode }) => ({ mode }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchUserItems();
      playSound("coins");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
