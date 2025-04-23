import { EXPANSION_COSTS } from "@/lib/game-constants";
import {
  createGridCell,
  getUserByMode,
  getUserGridCells,
  updateUserStatistic,
} from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { validMode } from "@/lib/validators/mode";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = req.nextUrl.searchParams.get("mode") || undefined;
  if (mode && !validMode(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const gridCells = await getUserGridCells(
    Number(fid),
    mode as Mode | undefined
  );
  return NextResponse.json(gridCells);
};

const requestSchema = z.object({
  mode: z.nativeEnum(Mode),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);
  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { mode } = requestBody.data;

  // check if user exists
  const user = await getUserByMode(Number(fid), mode);
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
      await createGridCell(Number(fid), i, nextSize.height, mode);
    }
    await createGridCell(Number(fid), nextSize.width, i, mode);
  }

  await updateUserStatistic(
    Number(fid),
    {
      expansions: user.expansions + 1,
      coins: user.coins - nextExpansion.coins,
    },
    mode
  );

  const gridCells = await getUserGridCells(Number(fid), mode);
  return NextResponse.json(gridCells);
};
