import {
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
  try {
    const streaks = await getUserStreaks(Number(fid));
    if (streaks.length === 0) {
      // TODO: give user 1 frost item
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
        const userFrost = await getUserItemBySlug(Number(fid), "frost");
        const lastActionDay = new Date(lastActionAt);
        lastActionDay.setHours(0, 0, 0, 0);
        const daysSinceLastAction =
          Math.floor(
            (new Date().getTime() - lastActionDay.getTime()) /
              (1000 * 60 * 60 * 24)
          ) - 1;
        const frostNeeded = daysSinceLastAction;
        if (userFrost?.quantity && userFrost.quantity >= frostNeeded) {
          await updateUserStreak(streaks[0].id, {
            lastActionAt: new Date(),
          });
          lastActionAt.setDate(lastActionAt.getDate() + 1);
          await applyUserFrost(
            Number(fid),
            streaks[0].id,
            lastActionAt,
            frostNeeded,
            userFrost.itemId
          );
        } else {
          await createUserStreak(Number(fid));
          const newEndDate = new Date(lastActionAt);
          newEndDate.setDate(newEndDate.getDate() + (userFrost?.quantity || 0));
          await updateUserStreak(streaks[0].id, {
            endedAt: newEndDate,
          });
          if (
            userFrost?.quantity &&
            userFrost.quantity > 0 &&
            frostNeeded > 0
          ) {
            lastActionAt.setDate(lastActionAt.getDate() + 1);
            await applyUserFrost(
              Number(fid),
              streaks[0].id,
              lastActionAt,
              userFrost?.quantity,
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
