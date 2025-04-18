import { EXPANSION_COSTS } from "@/lib/game-constants";
import {
  createGridCell,
  getUserByMode,
  getUserGridCells,
  updateUserStatistic,
} from "@/lib/prisma/queries";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gridCells = await getUserGridCells(Number(fid));
  return NextResponse.json(gridCells);
};

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // check if user exists
  const user = await getUserByMode(Number(fid));
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // check if the user has reached the maximum expansion level
  if (user.expansions > EXPANSION_COSTS.length) {
    return NextResponse.json(
      { error: "No more expansions available" },
      { status: 400 }
    );
  }

  // check if the user has reached the required level
  const nextExpansion = EXPANSION_COSTS[user.expansions - 1];
  const { currentLevel: userLevel } = getCurrentLevelAndProgress(user.xp);
  if (userLevel < nextExpansion.level) {
    return NextResponse.json(
      { error: "User level is too low for this expansion" },
      { status: 400 }
    );
  }

  // check if the user has enough coins to expand
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

  await updateUserStatistic(Number(fid), {
    expansions: user.expansions + 1,
    coins: user.coins - nextExpansion.coins,
  });

  const gridCells = await getUserGridCells(Number(fid));
  return NextResponse.json(gridCells);
};
