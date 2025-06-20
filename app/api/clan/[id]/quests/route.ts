import {
  getClanQuestById,
  getClanQuestsByClanId,
  getUserItemByItemId,
  incrementClanXp,
  updateClanQuest,
  updateUserItem,
} from "@/lib/prisma/queries";
import { Mode, QuestStatus } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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

    const clanQuests = await getClanQuestsByClanId({
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

const updateClanQuestSchema = z.object({
  questId: z.string(),
  amount: z.number().min(1, "Amount must be at least 1").int(),
});

export async function POST(
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

    const body = await req.json();
    const parsedBody = updateClanQuestSchema.parse(body);

    const { questId, amount } = parsedBody;

    // step 1: check that the quest is valid and available
    const clanQuest = await getClanQuestById(clanId, questId, {
      includeQuest: true,
    });
    if (!clanQuest || !clanQuest.quest) {
      return NextResponse.json(
        { error: "Clan quest not found" },
        { status: 404 }
      );
    }
    // step 2: get the quest's item and check if the user has enough items
    const questItem = clanQuest.quest.item;
    const userItem = await getUserItemByItemId(
      Number(fid),
      questItem.id,
      Mode.Classic
    );
    if (!userItem || userItem.quantity < amount) {
      return NextResponse.json(
        { error: "Not enough items to fill the amount requested" },
        { status: 400 }
      );
    }
    // step 3: update the clan quest with the provided amount
    const updateData = {
      clanId,
      questId,
      progress: clanQuest.progress + amount,
      status:
        clanQuest.progress + amount >= clanQuest.quest.amount
          ? QuestStatus.Completed
          : (clanQuest.status as QuestStatus),
      completedAt:
        clanQuest.progress + amount >= clanQuest.quest.amount
          ? new Date()
          : undefined,
    };
    await updateClanQuest(updateData);
    await updateUserItem(
      Number(fid),
      questItem.id,
      userItem.quantity - amount,
      Mode.Classic
    );
    // step 4: check if the status should be updated to 'completed' and quest's xp should be rewarded to the clan
    if (updateData.status === QuestStatus.Completed) {
      await incrementClanXp(clanId, clanQuest.quest.xp);
    }
    // step 5: return success response
    return NextResponse.json({
      message: "Clan quest updated successfully",
      quest: {
        ...clanQuest,
        progress: updateData.progress,
        status: updateData.status,
        completedAt: updateData.completedAt,
      },
    });
  } catch (error) {
    console.error("Error creating clan quest:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create clan quest" },
      { status: 500 }
    );
  }
}
