import { CropType } from "@/types/game";
import { useMutation } from "@tanstack/react-query";

export const usePlantSeed = () => {
  const mutation = useMutation({
    mutationFn: async ({
      x,
      y,
      cropType,
    }: {
      x: number;
      y: number;
      cropType: CropType;
    }) => {
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "plant", cropType }),
      });
      return res.json();
    },
  });

  return mutation;
};
