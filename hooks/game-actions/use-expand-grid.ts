import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useExpandGrid = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUser,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUser: () => Promise<void>;
}) => {
  const { playSound } = useAudio();
  return useApiMutation<unknown, void>({
    url: "/api/grid-cells",
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUser();
      refetchUser();
      playSound("coins");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });
};
