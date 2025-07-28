import {
  MILESTONE_INTERVAL,
  MILESTONE_REWARD,
  MONTHLY_REWARDS,
} from "@/lib/game-constants";
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
  streakId: z.string().min(1),
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

  // Calculate which day we're claiming rewards for
  const dayToClaim = lastStreak.lastClaimed + 1;

  // Check if this is a milestone day (multiple of 50)
  const isMilestone = dayToClaim % MILESTONE_INTERVAL === 0 && dayToClaim > 0;

  let rewards;

  if (isMilestone) {
    // Calculate milestone rewards
    const milestoneMultiplier = dayToClaim / MILESTONE_INTERVAL;
    const quantity = Math.min(
      MILESTONE_REWARD.baseQuantity * milestoneMultiplier,
      MILESTONE_REWARD.maxQuantity
    );

    rewards = [
      {
        itemId: MILESTONE_REWARD.itemId,
        quantity: quantity,
      },
    ];
  } else {
    // Use regular cycle rewards
    const cycleDay = ((dayToClaim - 1) % MONTHLY_REWARDS.length) + 1;
    const rewardData = MONTHLY_REWARDS.find((r) => r.day === cycleDay);

    if (!rewardData) {
      return NextResponse.json({ error: "Rewards not found" }, { status: 500 });
    }

    rewards = rewardData.rewards;
  }

  const userItems = await getUserItems(Number(fid), Mode.Classic);

  // Update the items in the database
  for (const item of rewards) {
    const userItem = userItems.find((i) => i.itemId === item.itemId);

    await updateUserItem(
      Number(fid),
      item.itemId,
      userItem ? userItem.quantity + item.quantity : item.quantity,
      Mode.Classic
    );
  }

  // Update the streak to set the last claimed day
  await updateStreakLastClaimed(streakId);

  return NextResponse.json({ message: "Item updated" }, { status: 200 });
};
