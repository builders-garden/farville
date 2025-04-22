import { useApiQuery } from "./use-api-query";
import { UserWithStatistic } from "@/lib/prisma/types";

export const useUserMe = () => {
  const { data, isLoading, refetch } = useApiQuery<UserWithStatistic>({
    queryKey: ["user"],
    url: `/api/users/me`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
