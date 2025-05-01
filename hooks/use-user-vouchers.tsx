import { UserHasVoucherWithVoucher } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";
import { Mode } from "@/lib/types/game";

export const useUserVouchers = (
  fid: number | undefined,
  activeToday: boolean,
  mode: Mode
) => {
  const url = `/api/users/me/vouchers?mode=${mode}&activeToday=${
    !!activeToday ? "true" : "false"
  }`;

  const {
    data: vouchers,
    isLoading,
    refetch,
    error,
  } = useApiQuery<UserHasVoucherWithVoucher[]>({
    queryKey: ["users", fid, "vouchers", activeToday, mode],
    url,
    isProtected: true,
    enabled: !!fid,
  });

  return {
    userVouchers: vouchers,
    isLoading,
    refetch,
    error,
  };
};
