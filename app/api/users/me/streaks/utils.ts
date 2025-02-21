import {
  applyUserFrost,
  createUserStreak,
  getUserFrostsByStreakId,
  updateUserStreak,
} from "@/lib/prisma/queries";
import { DbStreak } from "@/supabase/types";
import { UserHasItem } from "@prisma/client";

/**
 * Check user activity and apply frost
 * @param streak the streak to check for activity and apply frost
 * @param userFrost the user's frost item
 * @param updateStreaks flag to determine whether to update the streaks in the database (not needed on sign-in)
 */
export const checkUserActivityAndApplyFrost = async (
  streak: DbStreak,
  userFrost: UserHasItem | null,
  updateStreaks: boolean
) => {
  const latestStreak = streak;
  const lastActionAt = new Date(latestStreak.lastActionAt);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (updateStreaks && lastActionAt >= yesterday) {
    await updateUserStreak(streak.id, {
      lastActionAt: new Date(),
    });
  } else {
    const userFrosts = await getUserFrostsByStreakId(streak.id);
    const lastFrostAt = userFrosts[0].frozenAt;
    const lastFrostOrActionAt =
      lastFrostAt > lastActionAt ? lastFrostAt : lastActionAt;

    const lastActionDay = new Date(lastFrostOrActionAt);
    const daysSinceLastAction =
      Math.floor(
        (new Date().getTime() - lastActionDay.getTime()) / (1000 * 60 * 60 * 24)
      ) - 1;
    const frostNeeded = daysSinceLastAction;
    const userFrostQuantity = userFrost?.quantity || 0;

    if (userFrostQuantity >= frostNeeded) {
      if (updateStreaks) {
        await updateUserStreak(streak.id, {
          lastActionAt: new Date(),
        });
      }
      if (userFrost && frostNeeded > 0) {
        lastFrostOrActionAt.setDate(lastFrostOrActionAt.getDate() + 1);
        await applyUserFrost(
          Number(streak.fid),
          streak.id,
          lastFrostOrActionAt,
          frostNeeded,
          userFrost?.itemId
        );
      }
    } else {
      if (updateStreaks) {
        await createUserStreak(Number(streak.fid));
      }
      const newEndDate = new Date(lastFrostOrActionAt);
      newEndDate.setDate(newEndDate.getDate() + (userFrostQuantity || 0));
      await updateUserStreak(streak.id, {
        endedAt: newEndDate,
      });
      if (userFrost && userFrostQuantity > 0 && frostNeeded > 0) {
        lastFrostOrActionAt.setDate(lastFrostOrActionAt.getDate() + 1);
        await applyUserFrost(
          Number(streak.fid),
          streak.id,
          lastFrostOrActionAt,
          userFrostQuantity,
          userFrost.itemId
        );
      }
    }
  }
};
