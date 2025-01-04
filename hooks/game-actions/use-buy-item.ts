import { useAudio } from "@/context/AudioContext";
import { useMutation } from "@tanstack/react-query";

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
  const mutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
      const res = await fetch(`/api/users/meitems/${itemId}`, {
        method: "POST",
        body: JSON.stringify({ action: "buy", itemId, quantity }),
      });
      return res.json();
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

  return mutation;
};
