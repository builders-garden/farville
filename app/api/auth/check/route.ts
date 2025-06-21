import { trackEvent } from "@/lib/posthog/server";
import { getUserModes } from "@/lib/prisma/queries";
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

  const userModes = await getUserModes(Number(fid));
  await initQuestsAndLeaderboardEntry(Number(fid), userModes);

  await checkOrInitClanQuests(Number(fid));

  trackEvent(Number(fid), "sign_in", {
    fid,
  });
  return NextResponse.json({ message: "ok" });
}
