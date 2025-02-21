import { FIRST_FROST_QUANTITY } from "@/lib/game-constants";
import {
  addUserItem,
  applyUserFrost,
  createUserStreak,
  getUserItemBySlug,
  getUserStreaks,
  updateUserStreak,
} from "@/lib/prisma/queries";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const streaks = await getUserStreaks(Number(fid));
  return NextResponse.json(streaks);
};

export const POST = async (req: NextRequest) => {
  const fid = req.headers.get("x-user-fid");
  if (!fid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userFrost = await getUserItemBySlug(Number(fid), "frost");
  try {
    const streaks = await getUserStreaks(Number(fid));
    if (streaks.length === 0) {
      // check here if the user has already a frost item otherwise give them one
      if (!userFrost || userFrost.quantity === 0) {
        await addUserItem(Number(fid), 29, FIRST_FROST_QUANTITY);
      }
      await createUserStreak(Number(fid));
    } else {
      const latestStreak = streaks[0];
      const lastActionAt = new Date(latestStreak.lastActionAt);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActionAt >= yesterday) {
        await updateUserStreak(streaks[0].id, {
          lastActionAt: new Date(),
        });
      } else {
        const lastActionDay = new Date(lastActionAt);
        lastActionDay.setHours(0, 0, 0, 0);
        const daysSinceLastAction =
          Math.floor(
            (new Date().getTime() - lastActionDay.getTime()) /
              (1000 * 60 * 60 * 24)
          ) - 1;
        const frostNeeded = daysSinceLastAction;
        const userFrostQuantity = userFrost?.quantity || 0;
        if (userFrostQuantity >= frostNeeded) {
          await updateUserStreak(streaks[0].id, {
            lastActionAt: new Date(),
          });
          lastActionAt.setDate(lastActionAt.getDate() + 1);
          if (userFrost && frostNeeded > 0) {
            await applyUserFrost(
              Number(fid),
              streaks[0].id,
              lastActionAt,
              frostNeeded,
              userFrost?.itemId
            );
          }
        } else {
          await createUserStreak(Number(fid));
          const newEndDate = new Date(lastActionAt);
          newEndDate.setDate(newEndDate.getDate() + (userFrostQuantity || 0));
          await updateUserStreak(streaks[0].id, {
            endedAt: newEndDate,
          });
          if (userFrost && userFrostQuantity > 0 && frostNeeded > 0) {
            lastActionAt.setDate(lastActionAt.getDate() + 1);
            await applyUserFrost(
              Number(fid),
              streaks[0].id,
              lastActionAt,
              userFrostQuantity,
              userFrost.itemId
            );
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
  return NextResponse.json({ message: "Streak updated" });
};
