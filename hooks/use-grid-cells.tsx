import { DbGridCell } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useGridCells = () => {
  const { data, isLoading, refetch } = useApiQuery<DbGridCell[]>({
    queryKey: ["gridCells"],
    url: "/api/grid-cells",
    isProtected: true,
  });

  return { gridCells: data, isLoading, refetch };
};
