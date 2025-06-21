import { useApiQuery } from "./use-api-query";

export const useAuthCheck = (isInMaintenance: boolean, fid?: string) => {
  return useApiQuery<{ message: string }>({
    queryKey: ["auth-check"],
    url: `/api/auth/check?fid=${fid}`,
    isProtected: true,
    retry: false,
    enabled: !isInMaintenance && !!fid,
  });
};
