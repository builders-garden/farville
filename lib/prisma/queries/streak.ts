import { prisma } from "../client";
import { Streak } from "@prisma/client";
import { getCurrentDayStreak } from "../../utils";
import { getUserFrostsByStreakId } from "./user-frost";

export const getUserStreaks = async (fid: number) => {
  return await prisma.streak.findMany({
    where: {
      fid,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
};

export const createUserStreak = async (fid: number) => {
  return await prisma.streak.create({
    data: {
      fid,
      startedAt: new Date(),
      lastActionAt: new Date(),
    },
  });
};

export const updateUserStreak = async (
  streakId: number,
  data: Partial<Streak>
) => {
  return await prisma.streak.update({
    where: { id: streakId },
    data,
  });
};

export const updateStreakLastClaimed = async (streakId: number) => {
  return await prisma.streak.update({
    where: { id: streakId },
    data: {
      lastClaimed: { increment: 1 },
    },
  });
};

export const getUserCurrentStreakNumber = async (fid: number) => {
  const streaks = await getUserStreaks(fid);
  const currentStreak = streaks[0];
  if (!currentStreak) {
    return 0;
  }

  const frostDays = (await getUserFrostsByStreakId(currentStreak.id)).map(
    (frost) => new Date(frost.frozenAt)
  );
  const currentStreakNumber = getCurrentDayStreak(currentStreak, frostDays);

  return currentStreakNumber;
};

interface StreaksCountResult {
  active_streaks_count: number;
}

export const getActiveStreaksCount = async (): Promise<number> => {
  const result = await prisma.$queryRaw<StreaksCountResult[]>`
    SELECT COUNT(*) AS active_streaks_count
    FROM public.streak s
    WHERE s."endedAt" IS NULL
      AND s."lastActionAt" >= CURRENT_DATE - INTERVAL '3 days';
  `;

  return result[0].active_streaks_count; // Return the count from the result
};

export interface TopStreaksResult {
  id: number;
  fid: number;
  startedAt: string;
  lastActionAt: string;
  frozen_days: number;
  streak_length: number;
}

export const getTopStreaks = async () => {
  const topStreaks = await prisma.$queryRaw`
    WITH streak_durations AS (
      SELECT 
        s.id,
        s.fid,
        s."startedAt",
        s."lastActionAt",
        COUNT(f."frozenAt") AS frozen_days,
        LEAST(
          (s."lastActionAt" - s."startedAt") + 1, 
          (CURRENT_DATE - s."startedAt") + 1 - COUNT(f."frozenAt")
        ) AS streak_length
      FROM public.streak s
      LEFT JOIN public.user_frost f ON s.id = f."streakId"
      WHERE s."endedAt" IS NULL
      GROUP BY s.id, s.fid, s."startedAt", s."lastActionAt"
    )
    SELECT * FROM streak_durations
    ORDER BY streak_length DESC
    LIMIT 5;
  `;

  return topStreaks as TopStreaksResult[];
};
