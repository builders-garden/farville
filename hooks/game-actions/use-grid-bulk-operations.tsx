"use client";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { GridBulkRequest } from "@/app/api/grid-bulk/route";
import { Dispatch, SetStateAction } from "react";
import { GridBulkResult } from "@/app/api/grid-bulk/utils";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toasterStyle } from "@/app/app";
import { RefetchType } from "../use-game-state";
import { ActionType } from "@/types/game";

export const useGridBulkOperations = ({
  setGridBulkResult,
  refetch,
  updateStreaks,
}: {
  setGridBulkResult: Dispatch<SetStateAction<GridBulkResult | undefined>>;
  refetch: RefetchType;
  updateStreaks: () => void;
}) => {
  const mutation = useApiMutation({
    url: () => "/api/grid-bulk",
    body: ({
      gridBulkOperations,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      toastId,
    }: {
      gridBulkOperations: GridBulkRequest;
      toastId: string;
    }) => gridBulkOperations,
    onMutate: ({}) => {},
    onSuccess: (
      data: { success: boolean; data: GridBulkResult },
      { toastId }
    ) => {
      if (data.data.type !== ActionType.Harvest) {
        setGridBulkResult(data.data);
        toast.dismiss(toastId);
      } else {
        if (data.success) {
          const crops = data.data.rewards?.cropsWithRewards.reduce(
            (acc, { crop, amount }) => {
              if (!acc[crop]) {
                acc[crop] = { amount: 0 };
              }
              acc[crop].amount += amount;
              return acc;
            },
            {} as Record<string, { amount: number }>
          );
          // add inside crops also the gold crops
          if (crops && data.data.rewards?.goldCrops) {
            for (const goldCrop of data.data.rewards.goldCrops) {
              if (!crops[goldCrop.crop]) {
                crops[goldCrop.crop] = { amount: 0 };
              }
              crops[goldCrop.crop].amount += goldCrop.amount;
            }
          }
          const cropMessages = crops
            ? Object.entries(crops).map(([crop, { amount }]) => {
                return (
                  <div className="flex items-center gap-2" key={crop}>
                    <span>+{amount}</span>
                    <div className="flex gap-1">
                      <Image
                        src={`/images/crop/${crop}.png`}
                        alt={crop}
                        width={18}
                        height={18}
                        className="inline-block ml-2"
                      />
                      <span>{crop.replace("-", " ")}</span>
                    </div>
                  </div>
                );
              })
            : null;
          toast.custom(
            <AnimatePresence>
              <motion.div
                className="flex flex-col align-start"
                style={toasterStyle}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 3, duration: 0.5 }}
              >
                {cropMessages}
              </motion.div>
            </AnimatePresence>,
            {
              id: toastId,
            }
          );
          setGridBulkResult(data.data);
        } else {
          toast.error("Operation failed!", { id: toastId });
          setGridBulkResult(undefined);
        }
      }
      updateStreaks();
    },
    onError: (error, { toastId }) => {
      toast.dismiss(toastId);
      toast.error(error.message);
      refetch.all();
    },
  });

  return mutation;
};
