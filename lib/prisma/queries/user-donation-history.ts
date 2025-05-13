import { User, UserDonationHistory } from "@prisma/client";
import { prisma } from "../client";
import { UserWithStatistic } from "../types";
import { Mode } from "@/lib/types/game";

export const getUserDonationsHistory = async ({
  mode,
  donatorFid,
  receiverFid,
  limit = 1,
}: {
  mode: Mode;
  donatorFid: number;
  receiverFid?: number;
  limit?: number;
}) => {
  return await prisma.userDonationHistory.findMany({
    where: {
      donatorFid,
      ...(receiverFid && { receiverFid }),
      mode,
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
  receiver: number,
  mode: Mode
) => {
  return await prisma.userDonationHistory.findFirst({
    where: {
      donatorFid: donator,
      receiverFid: receiver,
      mode,
    },
    orderBy: {
      lastDonation: "desc",
    },
  });
};

export interface DbUserDonationWithUsers extends UserDonationHistory {
  donatorUser: UserWithStatistic;
  receiverUser: UserWithStatistic;
}

export const getUserDonationsOfToday = async (
  donatorFid: number,
  mode: Mode
): Promise<
  (UserDonationHistory & {
    donatorUser: User;
    receiverUser: User;
  })[]
> => {
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return await prisma.userDonationHistory.findMany({
    where: {
      mode,
      donatorFid,
      lastDonation: {
        gte: startOfDay,
      },
    },
    orderBy: {
      lastDonation: "desc",
    },
    include: {
      donatorUser: true,
      receiverUser: true,
    },
  });
};

export const updateUserDonationHistory = async (
  userDonation: UserDonationHistory
) => {
  return await prisma.userDonationHistory.upsert({
    where: {
      donatorFid_receiverFid_mode: {
        donatorFid: userDonation.donatorFid,
        receiverFid: userDonation.receiverFid,
        mode: userDonation.mode,
      },
    },
    update: userDonation,
    create: userDonation,
  });
};
