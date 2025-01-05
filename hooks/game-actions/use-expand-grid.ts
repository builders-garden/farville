import { useApiMutation } from "@/hooks/use-api-mutation";

export const useExpandGrid = () => {
  return useApiMutation<unknown, void>({
    url: "/api/grid-cells",
  });
};
