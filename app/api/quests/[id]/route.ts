import { NextRequest, NextResponse } from "next/server";
import {
  getQuestById,
  getUserQuestById,
  updateUserQuest,
} from "@/supabase/queries";

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

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  const { status } = await req.json();
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userQuest = await getUserQuestById(Number(fid), Number(id));
  if (!userQuest) {
    return NextResponse.json(
      { error: "User quest not found" },
      { status: 404 }
    );
  }
  await updateUserQuest(Number(fid), Number(id), { status });
  return NextResponse.json({ success: true, status });
}
