import { useApiQuery } from "./use-api-query";

export const useUserFrosts = (fid?: number) => {
  const { data, isLoading, refetch } = useApiQuery<{
    allFrostsDates: Date[];
    lastStreakDates: Date[];
  }>({
    queryKey: ["user-frosts", fid],
    url: !fid ? "/api/users/me/frosts" : `/api/users/${fid}/frosts`,
    isProtected: true,
  });

  return { userFrosts: data, isLoading, refetch };
};
