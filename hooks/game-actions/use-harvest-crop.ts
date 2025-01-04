"use client";

import { useAudio } from "@/context/AudioContext";
import { useMutation } from "@tanstack/react-query";

interface HarvestResponse {
  rewards: {
    xp: number;
    amount: number;
  };
}

export const useHarvestCrop = ({
  refetchGridCells,
  refetchUserItems,
  refetchUser,
  isActionInProgress,
  setIsActionInProgress,
}: {
  refetchGridCells: () => Promise<void>;
  refetchUserItems: () => Promise<void>;
  refetchUser: () => Promise<void>;
  isActionInProgress: boolean;
  setIsActionInProgress: (value: boolean) => void;
}) => {
  const { playSound } = useAudio();
  const mutation = useMutation<
    HarvestResponse,
    Error,
    { x: number; y: number }
  >({
    mutationFn: async ({ x, y }) => {
      if (isActionInProgress) return;

      setIsActionInProgress(true);
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "harvest" }),
      });

      if (!res.ok) {
        throw new Error("Failed to harvest crop");
      }

      return res.json();
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      refetchUser();
      playSound("harvest");
    },
    onSettled: () => {
      setIsActionInProgress(false);
    },
  });

  return mutation;
};
