import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Mode } from "@/lib/types/game";

interface ExpandGridProps {
  mode: Mode;
}

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
  return useApiMutation<unknown, ExpandGridProps>({
    url: "/api/grid-cells",
    body: ({ mode }) => ({
      mode,
    }),
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
