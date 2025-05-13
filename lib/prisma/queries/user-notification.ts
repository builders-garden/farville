import { Prisma, UserNotification } from "@prisma/client";
import { prisma } from "../client";

export const getUserNotifications = async (
  fid: number,
  limit?: number
): Promise<UserNotification[]> => {
  const notifications = await prisma.userNotification.findMany({
    where: { fid },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications;
};

export const createUserNotification = async (
  notification: Prisma.UserNotificationUncheckedCreateInput
): Promise<UserNotification> => {
  const data = await prisma.userNotification.create({
    data: notification,
  });

  return data;
};

export const getUserNotificationsByCategory = async (
  fid: number,
  category: string,
  limit?: number,
  dates: {
    createdBefore?: Date;
    createdAfter?: Date;
  } = {}
): Promise<UserNotification[]> => {
  const notifications = await prisma.userNotification.findMany({
    where: {
      fid,
      category,
      createdAt: {
        ...(dates.createdBefore && { lte: dates.createdBefore }),
        ...(dates.createdAfter && { gte: dates.createdAfter }),
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications;
};

export const getUserNotificationById = async (
  id: number
): Promise<UserNotification | null> => {
  const notification = await prisma.userNotification.findUnique({
    where: { id },
  });

  return notification;
};

export const updateUserNotification = async (
  id: number,
  updates: Partial<Omit<UserNotification, "id" | "createdAt">>
): Promise<UserNotification> => {
  const updatedNotification = await prisma.userNotification.update({
    where: { id },
    data: {
      ...updates,
    },
  });

  return updatedNotification;
};

export const deleteUserNotification = async (id: number): Promise<void> => {
  await prisma.userNotification.delete({
    where: { id },
  });
};
