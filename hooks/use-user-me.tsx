import { Mode } from "@/lib/types/game";
import { useApiQuery } from "./use-api-query";
import { UserWithStatistic } from "@/lib/prisma/types";

export const useUserMe = (mode: Mode) => {
  const { data, isLoading, refetch } = useApiQuery<UserWithStatistic>({
    queryKey: ["user", mode],
    url: `/api/users/me?mode=${mode}`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
