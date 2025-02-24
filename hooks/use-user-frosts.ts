import { useApiQuery } from "./use-api-query";

export const useUserFrosts = () => {
  const { data, isLoading, refetch } = useApiQuery<{
    allFrostsDates: Date[];
    lastStreakDates: Date[];
  }>({
    queryKey: ["user-frosts"],
    url: "/api/users/me/frosts",
    isProtected: true,
  });

  return { userFrosts: data, isLoading, refetch };
};
