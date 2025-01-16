import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUserMe = () => {
  const { data, isLoading, refetch } = useApiQuery<DbUser>({
    queryKey: ["user"],
    url: `/api/users/me`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
