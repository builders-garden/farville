import { useMutation } from "@tanstack/react-query";

interface HarvestResponse {
  rewards: {
    xp: number;
    amount: number;
  };
}

export const useHarvestCrop = () => {
  const mutation = useMutation<
    HarvestResponse,
    Error,
    { x: number; y: number }
  >({
    mutationFn: async ({ x, y }) => {
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "harvest" }),
      });

      if (!res.ok) {
        throw new Error("Failed to harvest crop");
      }

      return res.json();
    },
  });

  return mutation;
};
