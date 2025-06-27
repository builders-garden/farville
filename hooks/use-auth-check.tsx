import { useApiQuery } from "./use-api-query";

export const useAuthCheck = (isInMaintenance: boolean, fid?: string) => {
  return useApiQuery<{
    message: string;
    data?: {
      isBot?: boolean;
    };
  }>({
    queryKey: ["auth-check", fid],
    url: `/api/auth/check?fid=${fid}`,
    isProtected: true,
    retry: false,
    enabled: !isInMaintenance && !!fid,
  });
};
