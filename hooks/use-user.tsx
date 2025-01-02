import { DbUser } from "@/supabase/types";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { data, isLoading, refetch } = useQuery<DbUser>({
    queryKey: ["user"],
    queryFn: () => fetch("/api/users/me").then((res) => res.json()),
  });

  return { user: data, isLoading, refetch };
};
