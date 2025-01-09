import { NextResponse } from "next/server";
import { getQuestById } from "@/supabase/queries";

export async function GET({ params }: { params: { id: string } }) {
  try {
    const questId = parseInt(params.id);
    if (isNaN(questId)) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
    }

    const quest = await getQuestById(questId);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    return NextResponse.json(quest);
  } catch (error) {
    console.error("Error fetching quest:", error);
    return NextResponse.json(
      { error: "Failed to fetch quest" },
      { status: 500 }
    );
  }
}
