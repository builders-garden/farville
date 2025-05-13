import { useApiQuery } from "./use-api-query";

export const useAuthCheck = (isInMaintenance: boolean) => {
  return useApiQuery<{ message: string }>({
    queryKey: ["auth-check"],
    url: "/api/auth/check",
    isProtected: true,
    retry: false,
    enabled: !!localStorage.getItem("token") && !isInMaintenance,
  });
};
