import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useUser = ({ fid }: { fid?: number }) => {
  const { data, isLoading, refetch } = useApiQuery<DbUser>({
    queryKey: ["user", fid],
    url: fid ? `/api/users/${fid}` : `/api/users/me`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
