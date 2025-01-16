import { useApiMutation } from "@/hooks/use-api-mutation";

interface CreateRequestVariables {
  itemId: number;
  quantity: number;
}

interface CreateRequestResponse {
  id: number;
  fid: number;
  itemId: number;
  quantity: number;
  createdAt: string;
}

export const useCreateRequest = () => {
  return useApiMutation<CreateRequestResponse, CreateRequestVariables>({
    url: "/api/requests",
    method: "POST",
    isProtected: true,
  });
};
