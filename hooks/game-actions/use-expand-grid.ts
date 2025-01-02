import { useMutation } from "@tanstack/react-query";

export const useExpandGrid = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/grid-cells", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to expand grid");
      }
      return response.json();
    }
  });

  return mutation;
};
