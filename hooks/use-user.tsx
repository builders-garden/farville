import { Mode } from "@/lib/types/game";
import { useApiQuery } from "./use-api-query";
import { UserWithStatistic } from "@/lib/prisma/types";

export const useUser = ({ mode, fid }: { mode: Mode; fid?: number }) => {
  const { data, isLoading, refetch } = useApiQuery<UserWithStatistic>({
    queryKey: ["user", fid],
    url: fid ? `/api/users/${fid}?mode=${mode}` : `/api/users/me?mode=${mode}`,
    isProtected: true,
    enabled: !!mode,
  });

  return { user: data, isLoading, refetch };
};
