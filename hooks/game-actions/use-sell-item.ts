import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAudio } from "@/context/AudioContext";
import sdk from "@farcaster/frame-sdk";

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
