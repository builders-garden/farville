"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";
import { Dispatch, SetStateAction } from "react";
import { GridBulkResult } from "@/app/api/grid-bulk/utils";

export const useGridBulkOperations = ({
  setGridBulkResult,
}: {
  setGridBulkResult: Dispatch<SetStateAction<GridBulkResult | undefined>>;
}) => {
  const mutation = useApiMutation({
    url: "/api/grid-bulk",
    body: (gridBulkOperation: GridBulkRequest) => gridBulkOperation,
    onMutate: ({}) => {},
    onSuccess: (data: { success: boolean; data: GridBulkResult }) => {
      if (data.success) {
        setGridBulkResult(data.data);
      } else {
        setGridBulkResult(undefined);
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
    // onSettled: (_data, _error, {}) => {
    //   // setIsLoading(false);
    // },
  });

  return mutation;
};
