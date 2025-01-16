import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAudio } from "@/context/AudioContext";

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
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchUser();
      refetchUserItems();
      playSound("coins");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
