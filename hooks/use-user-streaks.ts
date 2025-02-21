import { DbStreak } from "@/supabase/types";
import { useApiQuery } from "./use-api-query";
import { useApiMutation } from "./use-api-mutation";

export const useUserStreaks = () => {
  const { data, isLoading, refetch } = useApiQuery<DbStreak[]>({
    queryKey: ["user-streaks"],
    url: "/api/users/me/streaks",
    isProtected: true,
  });

  return { userStreaks: data, isLoading, refetch };
};

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

export const useUpdateUserFrosts = ({
  refetchStreaks,
  refetchUserItems,
  refetchFrosts,
}: {
  refetchStreaks: () => void;
  refetchUserItems: () => void;
  refetchFrosts: () => void;
}) => {
  return useApiMutation<void>({
    url: "/api/users/me/streaks/frosts",
    onSuccess: () => {
      refetchStreaks();
      refetchUserItems();
      refetchFrosts();
    },
    mutationKey: ["update-user-frosts"],
  });
};
