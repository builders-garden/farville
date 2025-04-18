import { Mode } from "@/lib/types/game";
import { prisma } from "../client";
import { UserGridCell } from "@prisma/client";

export const getUserGridCells = async (
  fid: number,
  mode: Mode = Mode.Classic
): Promise<UserGridCell[]> => {
  const cells = await prisma.userGridCell.findMany({
    where: {
      fid,
      mode,
    },
    orderBy: {
      x: "asc",
      y: "asc",
    },
  });
  return cells;
};

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

export const initializeGrid = async (
  fid: number,
  mode: Mode = Mode.Classic
): Promise<void> => {
  const initialSize = {
    width: 2,
    height: 2,
  };

  // Create a grid of cells based on the initial size
  const cells = [];
  for (let x = 1; x <= initialSize.width; x++) {
    for (let y = 1; y <= initialSize.height; y++) {
      cells.push({
        fid,
        mode,
        x,
        y,
      });
    }
  }

  // Use Prisma to insert all cells at once
  await prisma.userGridCell.createMany({
    data: cells,
    skipDuplicates: true, // Ensures no conflicts on unique constraints
  });
};

export const createGridCell = async (
  fid: number,
  x: number,
  y: number,
  mode: Mode = Mode.Classic
): Promise<void> => {
  await prisma.userGridCell.upsert({
    where: {
      fid_x_y_mode: {
        fid,
        x,
        y,
        mode,
      },
    },
    update: {}, // No updates needed since it's an upsert
    create: {
      fid,
      x,
      y,
      mode,
    },
  });
};
