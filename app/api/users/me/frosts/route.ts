import { getUserFrosts } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import { FIRST_FROST_QUANTITY } from "@/lib/game-constants";
import {
  addUserItem,
  getUserItemBySlug,
  getUserStreaks,
} from "@/lib/prisma/queries";
import { checkUserActivityAndApplyFrost } from "../streaks/utils";

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const userFrost = await getUserItemBySlug(Number(fid), "frost");
    const streaks = await getUserStreaks(Number(fid));
    if (streaks.length === 0 && (!userFrost || userFrost.quantity === 0)) {
      await addUserItem(Number(fid), 29, FIRST_FROST_QUANTITY);
    } else if (streaks.length > 0) {
      await checkUserActivityAndApplyFrost(streaks[0], userFrost, false);
    }
  } catch (error) {
    console.error("Error updating streak:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: "Frost airdropped or applied" });
};

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const frosts = await getUserFrosts(Number(fid));
  return NextResponse.json(frosts);
};
