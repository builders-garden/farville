import { useMutation } from "@tanstack/react-query";

export const useFertilize = () => {
  const mutation = useMutation({
    mutationFn: async ({ x, y }: { x: number; y: number }) => {
      const res = await fetch(`/api/grid-cells/${x}/${y}`, {
        method: "POST",
        body: JSON.stringify({ action: "fertilize" }),
      });
      return res.json();
    },
  });

  return mutation;
};
