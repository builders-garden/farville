import { EXPANSION_COSTS } from "@/lib/game-constants";
import { trackEvent } from "@/lib/posthog/server";
import {
  getUser,
  getGridCells,
  createGridCell,
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
    return NextResponse.json(
      { error: "No more expansions available" },
      { status: 400 }
    );
  }

  const nextExpansion = EXPANSION_COSTS[user.expansions - 1];
  if (user.coins < nextExpansion.coins) {
    return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
  }

  const { nextSize } = nextExpansion;
  for (let i = 1; i <= nextSize.width; i++) {
    if (i < nextSize.width) {
      await createGridCell(Number(fid), i, nextSize.height);
    }
    await createGridCell(Number(fid), nextSize.width, i);
  }

  await updateUser(Number(fid), {
    expansions: user.expansions + 1,
    coins: user.coins - nextExpansion.coins,
  });

  const gridCells = await getGridCells(Number(fid));
  trackEvent(Number(fid), "grid-cells-expanded", {
    nextSize: nextSize,
  });
  return NextResponse.json(gridCells);
};
