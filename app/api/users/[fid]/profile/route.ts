import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getCurrentDayStreak } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { fid: string } }
) {
  try {
    const fid = parseInt(params.fid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const supabase = createClient();

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("fid", fid)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch special crops
    const { data: specialCrops, error: specialCropsError } = await supabase
      .from("user_items")
      .select(
        `
        *,
        item:items(*)
      `
      )
      .eq("user_fid", fid)
      .eq("items.category", "special-crop");

    // Fetch harvested crops summary
    const { data: harvestedCropsSummary, error: harvestError } = await supabase
      .from("user_harvested_crops")
      .select("*")
      .eq("user_fid", fid);

    // Fetch streak data
    const { data: streaksData, error: streaksError } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_fid", fid)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Fetch frost data for streak calculation
    const { data: frostsData } = await supabase
      .from("user_frosts")
      .select("*")
      .eq("user_fid", fid)
      .single();

    // Calculate level from XP
    const xp = user.xp || 0;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

    // Calculate current streak days
    let currentStreakDays = 0;
    let lastStreakDates: Date[] = [];

    if (frostsData?.last_streak_dates) {
      lastStreakDates = frostsData.last_streak_dates.map(
        (date: string) => new Date(date)
      );
    }

    if (streaksData) {
      currentStreakDays = getCurrentDayStreak(streaksData, lastStreakDates);
    }

    return NextResponse.json({
      user,
      specialCrops: specialCrops || [],
      harvestedCropsSummary: harvestedCropsSummary || [],
      level,
      currentStreakDays,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
