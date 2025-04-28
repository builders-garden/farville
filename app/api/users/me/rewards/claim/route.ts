import { MONTHLY_REWARDS } from "@/lib/game-constants";
import {
  getUserCurrentStreakNumber,
  getUserItems,
  getUserStreaks,
  updateStreakLastClaimed,
  updateUserItem,
} from "@/lib/prisma/queries";
import { Mode } from "@/lib/types/game";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  streakId: z.number().min(1),
});

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestJson = await req.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return Response.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { streakId } = requestBody.data;

  const streaks = await getUserStreaks(Number(fid));
  if (streaks.length === 0) {
    return NextResponse.json({ error: "Streak not found" }, { status: 404 });
  }
  const lastStreak = streaks[0];

  // check if the streak is available to claim
  if (lastStreak.endedAt !== null) {
    return NextResponse.json(
      { error: "Streak ended! You can not claim rewards from a dead streak" },
      { status: 400 }
    );
  }

  const currentDayStreak = await getUserCurrentStreakNumber(Number(fid));

  if (lastStreak.lastClaimed === currentDayStreak) {
    return NextResponse.json(
      { error: "Rewards already claimed" },
      { status: 400 }
    );
  }

  const rewards = MONTHLY_REWARDS.find(
    (r) => r.day === (lastStreak.lastClaimed % MONTHLY_REWARDS.length) + 1
  )?.rewards;

  if (!rewards) {
    return NextResponse.json({ error: "Rewards not found" }, { status: 500 });
  }

  const userItems = await getUserItems(Number(fid), Mode.Classic);

  // Update the items in the database
  for (const item of rewards) {
    const userItem = userItems.find((i) => i.itemId === item.itemId);

    await updateUserItem(
      Number(fid),
      item.itemId,
      userItem ? userItem.quantity + item.quantity : item.quantity
    );
  }

  // Update the streak to set the last claimed day
  await updateStreakLastClaimed(streakId);

  return NextResponse.json({ message: "Item updated" }, { status: 200 });
};
