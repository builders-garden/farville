"use client";

import { useAudio } from "@/context/AudioContext";
import { SeedType } from "@/types/game";
import { useMutation } from "@tanstack/react-query";

export const usePlantSeed = ({
  refetchGridCells,
  refetchUserItems,
}: {
  refetchGridCells: () => void;
  refetchUserItems: () => void;
}) => {
  const { playSound } = useAudio();
  const mutation = useMutation({
    mutationFn: async ({
      x,
      y,
      seedType,
    }: {
      x: number;
      y: number;
      seedType: SeedType;
    }) => {
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "plant", seedType }),
      });
      return res.json();
    },
    onSuccess: () => {
      refetchGridCells();
      refetchUserItems();
      playSound("plant");
    },
  });

  return mutation;
};
