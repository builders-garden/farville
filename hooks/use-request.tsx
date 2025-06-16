import { useApiQuery } from "./use-api-query";
import { User, Request as DbRequest, Item } from "@prisma/client";

type Request = DbRequest & { item: Item; user: User };

export const useRequest = (id: string) => {
  const {
    data: request,
    isLoading,
    refetch,
  } = useApiQuery<Request>({
    queryKey: ["request", id],
    url: `/api/requests/${id}`,
    method: "GET",
    isProtected: true,
    staleTime: 0,
  });

  return { request, isLoading, refetch };
};
