import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface ClaimRewardVariables {
  rewards: { itemId: number; quantity: number }[];
}

export const useClaimReward = ({
  refetchUserItems,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUserItems: () => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation<unknown, ClaimRewardVariables>({
    url: () => `/api/users/me/rewards/claim`,
    body: (rewards) => rewards,
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      console.log("Claimed rewards");
      refetchUserItems();
      playSound("coins");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
