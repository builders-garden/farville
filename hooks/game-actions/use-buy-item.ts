import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  hapticsImpactOccurred,
  hapticsNotificationOccurred,
} from "@/lib/farcaster";
import { MarketActionType, Mode } from "@/lib/types/game";

interface BuyItemVariables {
  itemId: number;
  quantity: number;
  mode: Mode;
}

export const useBuyItem = ({
  refetchUser,
  refetchUserItems,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUser: () => void;
  refetchUserItems: () => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation<unknown, BuyItemVariables>({
    url: ({ itemId }) => `/api/users/me/items/${itemId}`,
    body: ({ itemId, quantity, mode }) => ({
      action: MarketActionType.Buy,
      itemId,
      quantity,
      mode,
    }),
    onMutate: async () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
      await hapticsImpactOccurred("light");
    },
    onSuccess: async () => {
      refetchUser();
      refetchUserItems();
      playSound("coins");
      await hapticsNotificationOccurred("success");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
