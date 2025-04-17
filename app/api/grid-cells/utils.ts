import { env } from "@/lib/env";
import Logger from "@/lib/logger";
import { qstashPublishJSON } from "@/lib/qstash";

// export const fertilize = async (fid: number, x: number, y: number) => {
//   const fertilizer = await getItemBySlug("fertilizer");
//   if (!fertilizer) {
//     throw new Error("Fertilizer not found");
//   }
//   const fertilizerItem = await getUserItemByItemId(fid, fertilizer.id);
//   if (!fertilizerItem) {
//     throw new Error("Player does not have enough fertilizer to fertilize");
//   }
//   const gridCell = await getGridCell(fid, x, y);
//   if (!gridCell) {
//     throw new Error("Grid cell not found");
//   }
//   if (!gridCell.plantedAt) {
//     throw new Error("Grid cell is not planted");
//   }
//   if (gridCell.isReadyToHarvest) {
//     throw new Error("Grid cell is ready to harvest");
//   }
//   await fertilizeGridCell(fid, x, y);
//   await removeUserItem(fid, fertilizer.id, 1);
//   return gridCell;
// };

export async function sendQuestsCalculation(
  fid: number,
  category: string,
  itemId?: number,
  itemAmount?: number
) {
  if (env.NEXT_PUBLIC_URL === "http://localhost:3000") {
    return;
  }

  const questBody = {
    fid,
    category,
    itemId,
    itemAmount,
  };

  const res = await qstashPublishJSON({
    url: `${env.NEXT_PUBLIC_URL}/api/qstash/quest`,
    body: questBody,
  });

  Logger.log(
    `(QSTASH) - sent quest calculation to QStash with id: ${res?.messageId}`
  );
}
