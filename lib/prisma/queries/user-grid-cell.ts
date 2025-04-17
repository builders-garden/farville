import { prisma } from "../client";
import { UserGridCell } from "@prisma/client";

export const updateGridCellsBulk = async (
  fid: number,
  cells: UserGridCell[]
) => {
  return await prisma.$transaction(
    async (tx) => {
      const updatedCells: UserGridCell[] = [];
      for (const cell of cells) {
        const updatedCell = await tx.userGridCell.update({
          where: {
            fid_x_y_mode: { fid, x: cell.x, y: cell.y, mode: cell.mode },
          },
          data: cell,
        });
        updatedCells.push({
          ...updatedCell,
          plantedAt: updatedCell.plantedAt || null,
          harvestAt: updatedCell.harvestAt || null,
          speedBoostedAt: updatedCell.speedBoostedAt || null,
          createdAt: updatedCell.createdAt,
        });
      }
      return updatedCells;
    },
    {
      maxWait: 14000,
      timeout: 14000,
    }
  );
};
