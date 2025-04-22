import { User } from "@prisma/client";
import { useApiQuery } from "./use-api-query";

export const useUserMe = () => {
  const { data, isLoading, refetch } = useApiQuery<User>({
    queryKey: ["user"],
    url: `/api/users/me`,
    isProtected: true,
  });

  return { user: data, isLoading, refetch };
};
