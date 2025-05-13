import { UserGridCell } from "@prisma/client";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useGridCells = (mode: Mode) => {
  const { data, isLoading, refetch } = useApiQuery<UserGridCell[]>({
    queryKey: ["gridCells", mode],
    url: `/api/grid-cells?mode=${mode}`,
    isProtected: true,
    enabled: !!mode,
  });

  return { gridCells: data, isLoading, refetch };
};
