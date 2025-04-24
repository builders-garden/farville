import { trackEvent } from "@/lib/posthog/server";
import {
  createUserLeaderboardEntry,
  getUserByMode,
  getUserLeaderboardEntry,
  initDailyUserQuests,
  initWeeklyUserQuests,
} from "@/lib/prisma/queries";
import { getUserHasQuests } from "@/lib/prisma/queries";
import { Mode, QuestType } from "@/lib/types/game";
import { getUserLeague } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid")!;
  if (!fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // generate new entry inside the user leaderboard if it doesn't exist
  let weeklyUserLeaderboard = await getUserLeaderboardEntry(Number(fid));

  if (!weeklyUserLeaderboard) {
    const user = await getUserByMode(Number(fid));
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const userLeague = getUserLeague(user.xp);
    weeklyUserLeaderboard = await createUserLeaderboardEntry(Number(fid), {
      league: userLeague,
    });
  }

  // Check if the user has daily, weekly and monthly quests
  // If not, initialize them
  const dailyQuests = await getUserHasQuests(Number(fid), Mode.Classic, {
    type: [QuestType.Daily],
    activeToday: true,
  });
  const weeklyQuests = await getUserHasQuests(Number(fid), Mode.Classic, {
    type: [QuestType.Weekly],
    activeToday: true,
  });
  if (!dailyQuests || dailyQuests?.length === 0) {
    await initDailyUserQuests(Number(fid));
  }
  if (!weeklyQuests || weeklyQuests?.length === 0) {
    await initWeeklyUserQuests(Number(fid));
  }

  trackEvent(Number(fid), "sign_in", {
    fid,
  });
  return NextResponse.json({ message: "ok" });
}
