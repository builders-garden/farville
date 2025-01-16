import { NextRequest, NextResponse } from "next/server";
import { getUserQuestById } from "@/supabase/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fid: string; questId: string }> }
) {
  try {
    const { fid, questId } = await params;
    if (isNaN(Number(fid)) || isNaN(Number(questId))) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const quest = await getUserQuestById(Number(fid), Number(questId));
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    return NextResponse.json(quest);
  } catch (error) {
    console.error("Error fetching user quest:", error);
    return NextResponse.json(
      { error: "Failed to fetch user quest" },
      { status: 500 }
    );
  }
}
