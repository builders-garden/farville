import { NextResponse } from "next/server";
import { getUserQuestById } from "@/supabase/queries";

export async function GET({
  params,
}: {
  params: { fid: string; questId: string };
}) {
  try {
    const fid = parseInt(params.fid);
    const questId = parseInt(params.questId);
    if (isNaN(fid) || isNaN(questId)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const quest = await getUserQuestById(fid, questId);
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
