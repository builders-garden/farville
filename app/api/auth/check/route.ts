import { trackEvent } from "@/lib/posthog/server";
import {
  createUserLeaderboardEntry,
  getUser,
  getUserLeaderboardEntry,
} from "@/lib/prisma/queries";
import { getUserLeague } from "@/lib/utils";
import {
  getUserQuests,
  initDailyUserQuests,
  // initMonthlyUserQuests,
  initWeeklyUserQuests,
} from "@/supabase/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const fid = request.headers.get("x-user-fid")!;
  if (!fid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const userLocalDate = searchParams.get("userLocalDate")!;

  // generate new entry inside the user leaderboard if it doesn't exist
  let weeklyUserLeaderboard = await getUserLeaderboardEntry(Number(fid));

  if (!weeklyUserLeaderboard) {
    const user = await getUser(Number(fid));
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
  const dailyQuests = await getUserQuests(Number(fid), {
    type: ["daily"],
    activeToday: true,
    timeToCompare: userLocalDate,
  });
  const weeklyQuests = await getUserQuests(Number(fid), {
    type: ["weekly"],
    activeToday: true,
    timeToCompare: userLocalDate,
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
