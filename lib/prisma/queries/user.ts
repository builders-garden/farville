import { Mode, UserType } from "@/lib/types/game";
import { prisma } from "../client";
import { Prisma, User } from "@prisma/client";
import { UserWithStatistic } from "../types";

import { FrameNotificationDetails } from "@farcaster/frame-sdk";

export const getUserNotificationDetails = async (
  fid: number
): Promise<FrameNotificationDetails | undefined> => {
  const user = await prisma.user.findUnique({
    where: { fid },
    select: { notificationDetails: true },
  });

  if (!user || !user.notificationDetails) return undefined;

  return typeof user.notificationDetails === "string" &&
    user.notificationDetails !== ""
    ? JSON.parse(user.notificationDetails)
    : (user.notificationDetails as FrameNotificationDetails);
};

export const createUserAndMode = async (
  user: Prisma.UserCreateInput
): Promise<UserWithStatistic> => {
  const newUser = await prisma.user.create({
    data: user,
    include: {
      statistics: {
        where: {
          mode: Mode.Classic,
        },
      },
    },
  });

  return {
    ...newUser.statistics[0],
    ...newUser,
    mode: newUser.statistics[0].mode as Mode,
    notificationDetails:
      typeof newUser.notificationDetails === "string"
        ? (JSON.parse(newUser.notificationDetails) as FrameNotificationDetails)
        : null,
    bot: newUser.bot as UserType,
  };
};

export const setUserNotificationDetails = async (
  fid: number,
  details: FrameNotificationDetails
): Promise<void> => {
  await prisma.user.update({
    where: { fid },
    data: {
      notificationDetails: JSON.stringify(details),
    },
  });
};

export const deleteUserNotificationDetails = async (
  fid: number
): Promise<void> => {
  await prisma.user.update({
    where: { fid },
    data: {
      notificationDetails: undefined,
    },
  });
};

export const updateUser = async (
  fid: number,
  updates: Prisma.UserUpdateInput
): Promise<User> => {
  const updatedUser = await prisma.user.update({
    where: {
      fid,
    },
    data: updates,
  });

  return updatedUser;
};

export const getUser = async (
  fid: number,
  includeStatistics = false
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { fid },
    include: {
      statistics: includeStatistics,
    },
  });

  if (!user) return null;

  return user;
};
