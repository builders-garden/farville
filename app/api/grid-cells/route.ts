import { EXPANSION_COSTS } from "@/lib/game-constants";
import {
  createGridCell,
  getUser,
  getGridCells,
  updateUser,
} from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gridCells = await getGridCells(Number(fid));
  return NextResponse.json(gridCells);
};

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(Number(fid));
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.expansions >= EXPANSION_COSTS.length) {
    console.log("No more expansions available");
    return NextResponse.json(
      { error: "No more expansions available" },
      { status: 400 }
    );
  }

  const nextExpansion = EXPANSION_COSTS[user.expansions];
  if (user.coins < nextExpansion.coins) {
    console.log("Insufficient funds");
    return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
  }

  // Get current size from previous expansion, or 2x2 for first expansion
  const currentSize =
    user.expansions === 0
      ? { width: 2, height: 2 }
      : EXPANSION_COSTS[user.expansions - 1].nextSize;

  const { nextSize } = nextExpansion;

  console.log("Current size:", currentSize, "Next size:", nextSize);

  // Create grid cells for new expansion area, only for new cells
  for (let x = 0; x < nextSize.width; x++) {
    for (let y = 0; y < nextSize.height; y++) {
      // Skip if cell would be in existing area
      if (x < currentSize.width && y < currentSize.height) {
        continue;
      }
      console.log("Creating new cell:", x, y);
      await createGridCell(Number(fid), x + 1, y + 1);
    }
  }

  // Update user's expansion level and coins
  await updateUser(Number(fid), {
    expansions: user.expansions + 1,
    coins: user.coins - nextExpansion.coins,
  });

  const gridCells = await getGridCells(Number(fid));
  return NextResponse.json(gridCells);
};
