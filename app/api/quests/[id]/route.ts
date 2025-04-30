import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Mode, QuestStatus } from "@/lib/types/game";
import {
  getQuestById,
  getUserByMode,
  getUserQuestById,
  updateUserCoins,
  updateUserQuest,
  updateUserWeeklyScore,
  updateUserXP,
} from "@/lib/prisma/queries";
import { getThisWeekMonday } from "@/lib/utils";

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

const requestSchema = z.object({
  status: z.nativeEnum(QuestStatus),
  mode: z.nativeEnum(Mode),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { status, mode } = requestBody.data;

  const user = await getUserByMode(Number(fid), mode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userQuest = await getUserQuestById(Number(fid), Number(id));
  if (!userQuest) {
    return NextResponse.json(
      { error: "User quest not found" },
      { status: 404 }
    );
  }
  // Check if the quest is already in the requested status
  if (userQuest.status === status) {
    return NextResponse.json(
      { error: "Quest already in this status" },
      { status: 400 }
    );
  }
  // Check if the quest is in a valid status transition
  if (
    (userQuest.status === QuestStatus.Incomplete &&
      status !== QuestStatus.Completed) ||
    (userQuest.status === QuestStatus.Completed &&
      status !== QuestStatus.Claimed) ||
    userQuest.status === QuestStatus.Claimed
  ) {
    return NextResponse.json(
      { error: "Invalid status transition" },
      { status: 400 }
    );
  }
  // check if the quest is completed
  if (
    status === QuestStatus.Completed &&
    userQuest.progress < userQuest.quest.amount
  ) {
    return NextResponse.json(
      { error: "Quest is not completed yet" },
      { status: 400 }
    );
  }

  // Update the user quest status
  await updateUserQuest(Number(fid), Number(id), { status });
  let didLevelUp = false;
  if (status === "claimed") {
    if (userQuest.quest.coins) {
      await updateUserCoins(
        Number(fid),
        user.coins + userQuest.quest.coins,
        mode
      );
    }
    if (userQuest.quest.xp) {
      const xp = await updateUserXP(Number(fid), userQuest.quest.xp, mode);
      const thisWeekMonday = getThisWeekMonday();
      if (
        userQuest.quest.startAt &&
        new Date(userQuest.quest.startAt) >= thisWeekMonday
      ) {
        await updateUserWeeklyScore(
          Number(fid),
          userQuest.quest.xp,
          xp.newLevel,
          user.xp,
          xp.didLevelUp,
          mode
        );
      }
      didLevelUp = xp.didLevelUp;
    }
  }

  return NextResponse.json({ success: true, status, didLevelUp });
}
