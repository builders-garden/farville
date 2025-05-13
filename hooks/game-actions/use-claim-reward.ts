import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface ClaimRewardVariables {
  streakId: string;
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
    body: ({ streakId }) => ({ streakId }),
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchUserItems();
      refetchStreaks();
      playSound("claimQuest");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
