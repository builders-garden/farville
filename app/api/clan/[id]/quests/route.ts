import { getClanQuests } from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const clanId = resolvedParams.id;

    // Validate clanId
    if (!clanId) {
      return NextResponse.json(
        { error: "Clan ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const activeToday = searchParams.get("activeToday") === "true";

    const clanQuests = await getClanQuests({
      clanId,
      active: activeToday,
      status: status,
    });
    return NextResponse.json({ quests: clanQuests });
  } catch (error) {
    console.error("Error fetching clan quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch clan quests" },
      { status: 500 }
    );
  }
}
