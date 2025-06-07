import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { MarketActionType, Mode } from "@/lib/types/game";
import sdk from "@farcaster/frame-sdk";

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
      await sdk.haptics.impactOccurred("light");
    },
    onSuccess: async () => {
      refetchUser();
      refetchUserItems();
      playSound("coins");
      await sdk.haptics.notificationOccurred("success");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
