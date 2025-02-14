import { trackEvent } from "@/lib/posthog/server";
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
  // const monthlyQuests = await getUserQuests(Number(fid), {
  //   type: ["monthly"],
  //   activeToday: true,
  //   timeToCompare: userLocalDate,
  // });
  if (!dailyQuests || dailyQuests?.length === 0) {
    await initDailyUserQuests(Number(fid));
  }
  if (!weeklyQuests || weeklyQuests?.length === 0) {
    await initWeeklyUserQuests(Number(fid));
  }
  // if (!monthlyQuests || monthlyQuests?.length === 0) {
  //   await initMonthlyUserQuests(Number(fid));
  // }

  trackEvent(Number(fid), "sign_in", {
    fid,
  });
  return NextResponse.json({ message: "ok" });
}
