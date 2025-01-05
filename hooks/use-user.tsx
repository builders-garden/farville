import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUser = () => {
  const { data, isLoading, refetch } = useApiQuery<DbUser>({
    queryKey: ["user"],
    url: "/api/users/me",
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
