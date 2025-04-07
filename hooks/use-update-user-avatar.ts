import { Dispatch, SetStateAction } from "react";
import { useApiMutation } from "./use-api-mutation";
import { DbUser } from "@/supabase/types";

export const useUpdateUserAvatar = ({
  setIsLoading,
  setUpdatedUserAvatar,
  refetchUser,
}: {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setUpdatedUserAvatar: Dispatch<SetStateAction<boolean>>;
  refetchUser: () => void;
}) => {
  return useApiMutation({
    url: () => `/api/users/me/collectibles/avatar`,
    body: ({ collectibleId }: { collectibleId: string }) => ({
      collectibleId,
    }),
    method: "POST",
    onSuccess: (data: { success: boolean; data: { user: DbUser } }) => {
      setUpdatedUserAvatar(true);
      setIsLoading(false);
      refetchUser();
    },
    onError: () => {
      setIsLoading(false);
    },
  });
};
