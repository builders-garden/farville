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
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const userModes = await getUserModes(Number(fid));
  await initQuestsAndLeaderboardEntry(Number(fid), userModes);

  await checkOrInitClanQuests(Number(fid));

  trackEvent(Number(fid), "sign_in", {
    fid,
  });
  return NextResponse.json({ message: "ok" });
}
