import { VoucherWithItem } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";

export const useVoucher = (slug: string) => {
  const url = slug ? `/api/vouchers/${slug}` : "";

  const {
    data: voucher,
    isLoading,
    refetch,
  } = useApiQuery<VoucherWithItem>({
    queryKey: ["voucher", slug],
    url,
    isProtected: true,
    enabled: !!slug,
  });

  return {
    voucher,
    isLoading,
    refetch,
  };
};
