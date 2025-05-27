import { Mode } from "@/lib/types/game";
import { prisma } from "../client";
import { UserGridCell } from "@prisma/client";

export const getUserGridCells = async (
  fid: number,
  mode: Mode
): Promise<UserGridCell[]> => {
  const cells = await prisma.userGridCell.findMany({
    where: {
      fid,
      mode,
    },
    orderBy: [
      {
        x: "asc",
      },
      {
        y: "asc",
      },
    ],
  });
  return cells;
};

export const updateGridCellsBulk = async (
  fid: number,
  cells: UserGridCell[]
) => {
  if (cells.length === 0) return [];

  // destructure used fields
  const { cropType, plantedAt, harvestAt, speedBoostedAt, isReadyToHarvest } =
    cells[0];

  // Build OR filter for all cell coordinates
  const orFilter = cells.map((cell) => ({
    fid,
    mode: cell.mode,
    x: cell.x,
    y: cell.y,
  }));

  // Perform a single updateMany
  const count = await prisma.userGridCell.updateMany({
    where: {
      OR: orFilter,
    },
    data: {
      cropType,
      plantedAt,
      harvestAt,
      speedBoostedAt,
      isReadyToHarvest,
    },
  });

  return count.count;
};

export const initializeGrid = async (
  fid: number,
  mode: Mode
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
  mode: Mode
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

export const getHarvestableCellsCount = async (
  fid: number,
  mode: Mode,
  withinMinutes: number = 3
): Promise<number> => {
  const threeMinutesFromNow = new Date(Date.now() + withinMinutes * 60 * 1000);

  const count = await prisma.userGridCell.count({
    where: {
      fid,
      mode,
      harvestAt: {
        not: null,
        lte: threeMinutesFromNow,
      },
    },
  });

  return count;
};

export const getExpiredBoostCellsCount = async (
  fid: number,
  mode: Mode,
  withinMinutes: number = 3
): Promise<number> => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const twoHoursPlusMinutesAgo = new Date(
    Date.now() - (2 * 60 * 60 * 1000 + withinMinutes * 60 * 1000)
  );

  const count = await prisma.userGridCell.count({
    where: {
      fid,
      mode,
      speedBoostedAt: {
        not: null,
        gte: twoHoursPlusMinutesAgo,
        lt: twoHoursAgo,
      },
    },
  });

  return count;
};
