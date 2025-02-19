import { useApiMutation } from "@/hooks/use-api-mutation";

export const useUpdateUserStreaks = ({
  refetchStreaks,
  refetchUserItems,
}: {
  refetchStreaks: () => void;
  refetchUserItems: () => void;
}) => {
  return useApiMutation<unknown>({
    url: () => `/api/users/me/streaks`,
    onSuccess: () => {
      refetchStreaks();
      refetchUserItems();
    },
  });
};
