import { useApiQuery } from "./use-api-query";
import { UserWithStatistic } from "@/lib/prisma/types";

export const useUser = ({ fid }: { fid?: number }) => {
  const { data, isLoading, refetch } = useApiQuery<UserWithStatistic>({
    queryKey: ["user", fid],
    url: fid ? `/api/users/${fid}` : `/api/users/me`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
