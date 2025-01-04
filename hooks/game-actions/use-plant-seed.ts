import { SeedType } from "@/types/game";
import { useMutation } from "@tanstack/react-query";

export const usePlantSeed = ({
  refetchGridCells,
}: {
  refetchGridCells: () => void;
}) => {
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
    },
  });

  return mutation;
};
