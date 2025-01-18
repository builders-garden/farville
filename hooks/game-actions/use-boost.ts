"use client";

import { useAudio } from "@/context/AudioContext";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useBoost = ({
  isActionInProgress,
  setIsActionInProgress,
  refetchGridCells,
  refetchUserItems,
  actionType,
}: {
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  actionType: "speed-boost" | "yield-boost";
}) => {
  const { playSound } = useAudio();
  const mutation = useApiMutation({
    url: ({ x, y }: { x: number; y: number }) => `/api/grid-cells/${x}/${y}`,
    body: () => ({ action: actionType }),
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      playSound("fertilize");
    },
    onMutate: () => {
      if (isActionInProgress) return;
      setIsActionInProgress(true);
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return mutation;
};
