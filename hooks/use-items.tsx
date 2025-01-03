import { DbItem } from "@/supabase/types";
import { useQuery } from "@tanstack/react-query";

export const useItems = () => {
  const { data, isLoading, refetch } = useQuery<DbItem[]>({
    queryKey: ["items"],
    queryFn: async () => {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      return response.json();
    },
  });

  return { items: data, isLoading, refetch };
};
