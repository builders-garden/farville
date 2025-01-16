import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface BuyItemVariables {
  itemId: number;
  quantity: number;
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
    body: ({ itemId, quantity }) => ({ action: "buy", itemId, quantity }),
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
