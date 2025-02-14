import { DbUserDonation } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

export const useDonationHistory = (donator?: number, receiver?: number) => {
  const { data: lastDonation, isLoading } = useApiQuery<DbUserDonation>({
    queryKey: ["donationHistory", donator, receiver],
    url: `/api/donation-history?donator=${donator}&receiver=${receiver}`,
    method: "GET",
    isProtected: true,
    enabled: !!donator && !!receiver,
  });

  return { lastDonation, isLoading };
};
