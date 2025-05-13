import { UserHarvestedCrop } from "@prisma/client";
import { prisma } from "../client";
import { CropType } from "@/lib/types/game";

export const getUserHarvestedCrops = async (
  fid: number
): Promise<UserHarvestedCrop[]> => {
  const crops = await prisma.userHarvestedCrop.findMany({
    where: { fid },
  });

  return crops;
};

export const getUserHarvestedCrop = async (
  fid: number,
  crop: string
): Promise<UserHarvestedCrop | null> => {
  const cropData = await prisma.userHarvestedCrop.findUnique({
    where: {
      fid_crop: {
        fid,
        crop,
      },
    },
  });

  return cropData;
};

export const incrementUserHarvestedCrop = async (
  fid: number,
  crop: CropType,
  amount: number
): Promise<UserHarvestedCrop> => {
  const updatedCrop = await prisma.userHarvestedCrop.update({
    where: {
      fid_crop: {
        fid,
        crop,
      },
    },
    data: {
      quantity: {
        increment: amount,
      },
    },
  });

  return updatedCrop;
};

export const upsertUserHarvestedCrop = async (
  fid: number,
  crop: string,
  quantity: number
): Promise<UserHarvestedCrop> => {
  const upsertedCrop = await prisma.userHarvestedCrop.upsert({
    where: {
      fid_crop: {
        fid,
        crop,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      fid,
      crop,
      quantity,
    },
  });

  return upsertedCrop;
};

export const deleteUserHarvestedCrop = async (
  fid: number,
  crop: string
): Promise<void> => {
  await prisma.userHarvestedCrop.delete({
    where: {
      fid_crop: {
        fid,
        crop,
      },
    },
  });
};
