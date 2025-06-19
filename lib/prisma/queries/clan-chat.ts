import { prisma } from "../client";
import { ClanChatMessage } from "@prisma/client";

export interface ClanChatMessageWithUser extends ClanChatMessage {
  user: {
    fid: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    selectedAvatarUrl: string | null;
    mintedOG: boolean;
  };
}

/**
 * Get clan chat messages with pagination
 */
export async function getClanChatMessages(
  clanId: string,
  limit: number = 50,
  cursor?: string
): Promise<ClanChatMessageWithUser[]> {
  return await prisma.clanChatMessage.findMany({
    where: {
      clanId,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    include: {
      user: {
        select: {
          fid: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          selectedAvatarUrl: true,
          mintedOG: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}

/**
 * Create a new clan chat message
 */
export async function createClanChatMessage(
  clanId: string,
  fid: number,
  message: string
): Promise<ClanChatMessageWithUser> {
  return await prisma.clanChatMessage.create({
    data: {
      clanId,
      fid,
      message,
    },
    include: {
      user: {
        select: {
          fid: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          selectedAvatarUrl: true,
          mintedOG: true,
        },
      },
    },
  });
}

/**
 * Get the latest chat messages for a clan
 */
export async function getLatestClanChatMessages(
  clanId: string,
  limit: number = 20
): Promise<ClanChatMessageWithUser[]> {
  const messages = await getClanChatMessages(clanId, limit);
  return messages.reverse(); // Return in chronological order (oldest first)
}

/**
 * Delete a chat message (for moderation)
 */
export async function deleteClanChatMessage(
  messageId: string,
  userFid: number
): Promise<void> {
  // Only leaders and officers can delete messages, or users can delete their own messages
  const message = await prisma.clanChatMessage.findUnique({
    where: { id: messageId },
    include: {
      clan: {
        include: {
          members: {
            where: { fid: userFid },
            select: { role: true },
          },
        },
      },
    },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const userMembership = message.clan.members[0];
  const canDelete =
    message.fid === userFid || // User's own message
    userMembership?.role === "leader" ||
    userMembership?.role === "officer";

  if (!canDelete) {
    throw new Error("You don't have permission to delete this message");
  }

  await prisma.clanChatMessage.delete({
    where: { id: messageId },
  });
}
