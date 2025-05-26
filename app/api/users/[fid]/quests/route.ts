import { NextRequest, NextResponse } from "next/server";
import { Mode, QuestStatus, QuestType } from "@/lib/types/game";
import { getUserHasQuests } from "@/lib/prisma/queries";
import { Geo } from "@vercel/functions";
import { geolocation, ipAddress } from "@vercel/functions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string }> }
) {
  try {
    const { fid: stringFid } = await params; // keep this await
    let ip: string | undefined = undefined;
    let geolocationDetails: Geo | null = null;
    try {
      ip = ipAddress(request);
      geolocationDetails = geolocation(request);
    } catch (error) {
      console.error("Error getting geolocation:", error);
    }
    console.log(
      "/api/users/[fid]/quests",
      "fid",
      stringFid,
      "ip",
      ip,
      "geolocation",
      JSON.stringify(geolocationDetails)
    );
    const fid = parseInt(stringFid);
    if (isNaN(fid)) {
      return NextResponse.json({ error: "Invalid FID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const itemId = searchParams.get("itemId");
    const activeToday = searchParams.get("activeToday");
    const mode = searchParams.get("mode");

    const quests = await getUserHasQuests(
      fid,
      mode as Mode,
      {
        status: status as QuestStatus,
        category: category || undefined,
        type: type ? [type as QuestType] : undefined,
        itemId: itemId ? parseInt(itemId) : undefined,
        activeToday: activeToday === "true",
      },
      {
        quest: true,
        item: true,
      }
    );

    // divide the quests by their type
    const dailyQuests = quests.filter((q) => q.quest.type === "daily");
    const weeklyQuests = quests.filter((q) => q.quest.type === "weekly");

    return NextResponse.json({
      daily: dailyQuests,
      weekly: weeklyQuests,
    });
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch user quests" },
      { status: 500 }
    );
  }
}
