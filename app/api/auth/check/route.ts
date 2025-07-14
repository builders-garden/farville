import { trackEvent } from "@/lib/posthog/server";
import { getUserByMode, getUserModes } from "@/lib/prisma/queries";
import { Mode, UserType } from "@/lib/types/game";
import {
  checkOrInitClanQuests,
  initQuestsAndLeaderboardEntry,
  userIsNotAdminAndIsNotProduction,
} from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid")!;
  if (!fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (userIsNotAdminAndIsNotProduction(Number(fid))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // if the fid is provided in the query params, check if it matches the fid in the header
  const contextFid = request.nextUrl.searchParams.get("fid");
  if (contextFid && contextFid !== fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByMode(Number(fid), Mode.Classic);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  if (user.bot === UserType.Bot) {
    return NextResponse.json({
      message: "nok",
      data: {
        isBot: true,
      },
    });
  }

  const userModes = await getUserModes(Number(fid));
  await initQuestsAndLeaderboardEntry(Number(fid), userModes);

  await checkOrInitClanQuests(Number(fid));

  trackEvent(Number(fid), "sign_in", {
    fid,
  });
  return NextResponse.json({ message: "ok" });
}
