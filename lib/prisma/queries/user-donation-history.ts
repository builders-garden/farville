import { prisma } from "../client";
import {
  DbUser,
  DbUserDonation,
  DbUserDonation as DbUserDonationPrisma,
} from "../types";

export const getUserDonationsHistory = async ({
  donatorFid,
  receiverFid,
  limit = 1,
}: {
  donatorFid: number;
  receiverFid?: number;
  limit?: number;
}) => {
  return await prisma.userDonationHistory.findMany({
    where: {
      donatorFid,
      ...(receiverFid && { receiverFid }),
    },
    orderBy: {
      lastDonation: "desc",
    },
    take: limit,
  });
};

// this function is used to return the last donation made by a user to a specific receiver
export const getUserDonationByReceiver = async (
  donator: number,
  receiver: number
) => {
  return await prisma.userDonationHistory.findFirst({
    where: {
      donatorFid: donator,
      receiverFid: receiver,
    },
    orderBy: {
      lastDonation: "desc",
    },
  });
};

export interface DbUserDonationWithUsers extends DbUserDonationPrisma {
  donator: DbUser;
  receiver: DbUser;
}

export const getUserDonationsOfToday = async (
  donatorFid: number
): Promise<DbUserDonationWithUsers[]> => {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const donations = await prisma.userDonationHistory.findMany({
    where: {
      donatorFid,
      lastDonation: {
        gte: startOfDay,
      },
    },
    orderBy: {
      lastDonation: "desc",
    },
    include: {
      users_user_donations_history_donatorFidTousers: true,
      users_user_donations_history_receiverFidTousers: true,
    },
  });

  return donations.map(
    ({
      users_user_donations_history_donatorFidTousers,
      users_user_donations_history_receiverFidTousers,
      ...donation
    }) => ({
      ...donation,
      donator: {
        ...users_user_donations_history_donatorFidTousers,
        createdAt: users_user_donations_history_donatorFidTousers.createdAt,
      },
      receiver: {
        ...users_user_donations_history_receiverFidTousers,
        createdAt: users_user_donations_history_receiverFidTousers.createdAt,
      },
    })
  );
};

export const updateUserDonationHistory = async (
  userDonation: DbUserDonation
) => {
  return await prisma.userDonationHistory.upsert({
    where: {
      donatorFid_receiverFid: {
        donatorFid: userDonation.donatorFid,
        receiverFid: userDonation.receiverFid,
      },
    },
    update: userDonation,
    create: userDonation,
  });
};
