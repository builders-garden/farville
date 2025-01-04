import {
  getUserItemByItemId,
  getGridCell,
  plantGridCell,
  removeUserItem,
  getItemBySlug,
} from "@/supabase/queries";
import { SeedType } from "@/types/game";

export const plantSeed = async (
  fid: number,
  x: number,
  y: number,
  seedType: SeedType
) => {
  const item = await getItemBySlug(seedType);
  if (!item) {
    throw new Error("Item not found");
  }
  const seed = await getUserItemByItemId(fid, item.id);
  if (!seed) {
    throw new Error("Player does not have enough seeds to plant");
  }
  const gridCell = await getGridCell(fid, x, y);
  if (gridCell?.plantedAt) {
    throw new Error("Grid cell is already planted");
  }

  const plantedCell = await plantGridCell(fid, x, y, item.slug.replace("-seeds", ""));

  await removeUserItem(fid, item.id);

  return plantedCell;
};


