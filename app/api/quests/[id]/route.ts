import { NextRequest, NextResponse } from "next/server";
import {
  getQuestById,
  getUserQuestById,
  updateUserCoins,
  updateUserQuest,
  updateUserXP,
} from "@/supabase/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
    }

    const quest = await getQuestById(Number(id));
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  if (status === "claimed") {
    await Promise.all([
      userQuest.quest.coins &&
        updateUserCoins(Number(fid), userQuest.quest.coins),
      userQuest.quest.xp && updateUserXP(Number(fid), userQuest.quest.xp),
    ]);
  }
  return NextResponse.json({ success: true, status });
}
