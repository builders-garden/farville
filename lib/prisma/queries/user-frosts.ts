import { Mode } from "@/lib/types/game";
import { prisma } from "../client";
import { getUserStreaks } from "./streak";
import { removeUserItem } from "./user-has-items";
import { UserFrost } from "@prisma/client";

export const getUserFrosts = async (fid: number) => {
  const streaks = await getUserStreaks(fid);
  const streakIds = streaks.map((streak) => streak.id);

  if (streakIds.length === 0) {
    return {
      allFrostsDates: [],
      lastStreakDates: [],
    };
  }

  const userFrosts: UserFrost[] = await prisma.userFrost.findMany({
    where: {
      streakId: {
        in: streakIds,
      },
    },
    orderBy: {
      frozenAt: "asc",
    },
  });

  const allFrostsDates = userFrosts.map((frost) => new Date(frost.frozenAt));

  const lastStreakId = streaks[0]?.id;
  const lastStreakFrosts = userFrosts.filter(
    (frost) => frost.streakId === lastStreakId
  );
  const lastStreakDates = lastStreakFrosts.map(
    (frost) => new Date(frost.frozenAt)
  );

  return {
    allFrostsDates,
    lastStreakDates,
  };
};

export const applyUserFrost = async (
  fid: number,
  streakId: number,
  from: Date,
  amount: number,
  frostItemId: number
) => {
  const records = Array.from({ length: amount }, (_, i) => {
    const date = new Date(from);
    date.setDate(date.getDate() + i);
    return {
      streakId,
      frozenAt: date,
    };
  });
  try {
    await prisma.userFrost.createMany({
      data: records,
    });
    // TODO: remember to manage this mode pass
    await removeUserItem(fid, frostItemId, amount, Mode.Classic);
  } catch (error) {
    console.error("Error creating user frosts:", error);
    throw new Error("Failed to apply user frost");
  }
};

export const getUserFrostsByStreakId = async (streakId: number) => {
  return await prisma.userFrost.findMany({
    where: {
      streakId,
    },
    orderBy: {
      frozenAt: "desc",
    },
  });
};
