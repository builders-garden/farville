import {
  createUserStreak,
  getUserItemBySlug,
  getUserStreaks,
} from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";
import { checkUserActivityAndApplyFrost } from "./utils";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const streaks = await getUserStreaks(Number(fid));
  return NextResponse.json(streaks);
};

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const userFrost = await getUserItemBySlug(Number(fid), "frost");
    const streaks = await getUserStreaks(Number(fid));
    if (streaks.length === 0) {
      await createUserStreak(Number(fid));
    } else {
      await checkUserActivityAndApplyFrost(streaks[0], userFrost, true);
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: "Streak updated" });
};
