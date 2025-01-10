import { NextRequest, NextResponse } from "next/server";
import { getQuests, createQuest } from "@/supabase/queries";
import { InsertDbQuest } from "@/supabase/types";

export async function GET() {
  try {
    const quests = await getQuests();
    return NextResponse.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const questData: InsertDbQuest = await request.json();
    const quest = await createQuest(questData);
    return NextResponse.json(quest, { status: 201 });
  } catch (error) {
    console.error("Error creating quest:", error);
    return NextResponse.json(
      { error: "Failed to create quest" },
      { status: 500 }
    );
  }
}
