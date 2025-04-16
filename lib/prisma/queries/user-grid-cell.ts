import { prisma } from "../client";
import { GridCell } from "@prisma/client";

export const updateGridCellsBulk = async (fid: number, cells: GridCell[]) => {
  return await prisma.$transaction(
    async (tx) => {
      const updatedCells: GridCell[] = [];
      for (const cell of cells) {
        const updatedCell = await tx.gridCell.update({
          where: { fid_x_y: { fid, x: cell.x, y: cell.y } },
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
