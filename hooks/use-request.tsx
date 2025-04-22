import { Item } from "@/lib/prisma/types";
import { useApiQuery } from "./use-api-query";
import { User, Request as DbRequest } from "@prisma/client";

type Request = DbRequest & { item: Item; user: User };

export const useRequest = (id: number) => {
  const { data: request, isLoading } = useApiQuery<Request>({
    queryKey: ["request", id],
    url: `/api/requests/${id}`,
    method: "GET",
    isProtected: true,
  });

  return { request, isLoading };
};
