import { UserGridCell } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useGridCells = () => {
  const { data, isLoading, refetch } = useApiQuery<UserGridCell[]>({
    queryKey: ["gridCells"],
    url: "/api/grid-cells",
    isProtected: true,
  });

  return { gridCells: data, isLoading, refetch };
};
