import { useApiQuery } from "./use-api-query";

export const useAuthCheck = () => {
  return useApiQuery<{ message: string }>({
    queryKey: ["auth-check"],
    url: "/api/auth/check?userLocalDate=" + new Date().toISOString(),
    isProtected: true,
    retry: false,
    enabled: !!localStorage.getItem("token")
  });
};
