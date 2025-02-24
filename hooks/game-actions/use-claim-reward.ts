import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface ClaimRewardVariables {
  streakId: number;
  rewards: { itemId: number; quantity: number }[];
}

export const useClaimReward = ({
  refetchUserItems,
  refetchStreaks,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchUserItems: () => void;
  refetchStreaks: () => void;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();

  return useApiMutation<unknown, ClaimRewardVariables>({
    url: () => `/api/users/me/rewards/claim`,
    body: ({ rewards, streakId }) => ({ rewards, streakId }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      console.log("Claimed rewards");
      refetchUserItems();
      refetchStreaks();
      playSound("claim-quest");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
