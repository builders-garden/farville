import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAudio } from "@/context/AudioContext";
import {
  hapticsImpactOccurred,
  hapticsNotificationOccurred,
} from "@/lib/farcaster";

export const useSellItem = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchUser,
  refetchUserItems,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchUser: () => void;
  refetchUserItems: () => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation({
    url: ({ itemId }: { itemId: number; quantity: number }) =>
      `/api/users/me/items/${itemId}`,
    body: (variables) => ({
      action: "sell",
      ...variables,
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
