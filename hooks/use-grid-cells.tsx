import { DbGridCell } from "@/supabase/types";
import { useQuery } from "@tanstack/react-query";

export const useGridCells = () => {
  const { data, isLoading, refetch   } = useQuery<DbGridCell[]>({
    queryKey: ["gridCells"],
    queryFn: async () => {
      const res = await fetch("/api/grid-cells");
      return res.json();
    },
  });
  return { gridCells: data, isLoading, refetch };
};
