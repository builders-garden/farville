import { Item } from "@/supabase/types";
import { DbRequest } from "@/supabase/types";
import { DbUser } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";

type Request = DbRequest & { item: Item; user: DbUser };

export const useRequest = (id: number) => {
  const { data: request, isLoading } = useApiQuery<Request>({
    queryKey: ["request", id],
    url: `/api/requests/${id}`,
    method: "GET",
    isProtected: true,
  });

  return { request, isLoading };
};
