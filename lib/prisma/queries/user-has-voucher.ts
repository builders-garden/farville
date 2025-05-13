import { Mode } from "@/lib/types/game";
import { prisma } from "../client";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { UserHasVoucherWithVoucher } from "../types";

/**
 * Get all vouchers for a user
 * @param fid - The fid of the user
 * @param mode - The mode of the user
 * @param activeToday - Whether to filter by active today
 * @returns All vouchers for the user
 */
export const getUserHasVouchers = async (
  fid: number,
  mode: Mode,
  activeToday: boolean
): Promise<UserHasVoucherWithVoucher[]> => {
  const vouchers = await prisma.userHasVoucher.findMany({
    where: { fid, voucher: { mode } },
    include: {
      user: true,
      voucher: {
        include: {
          item: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // filter by activeToday if true
  if (activeToday) {
    const endDate = MODE_DEFINITIONS[mode].endDate;
    const today = new Date();
    if (endDate && endDate <= today) {
      return [];
    }
  }

  return vouchers;
};

/**
 * Get a user's voucher by slug
 * @param fid - The fid of the user
 * @param voucherSlug - The slug of the voucher
 * @returns The user's vouchers
 */
export const getUserHasVouchersBySlug = async (
  fid: number,
  voucherSlug: string
): Promise<UserHasVoucherWithVoucher | null> => {
  const voucher = await prisma.userHasVoucher.findFirst({
    where: { fid, voucher: { slug: voucherSlug } },
    include: {
      user: true,
      voucher: {
        include: {
          item: true,
        },
      },
    },
  });

  return voucher;
};

/**
 * Add a user voucher
 * @param fid - The fid of the user
 * @param voucherId - The id of the voucher
 * @returns The user voucher
 */
export const addUserVoucher = async (fid: number, voucherId: number) => {
  return await prisma.userHasVoucher.upsert({
    where: {
      fid_voucherId: {
        fid,
        voucherId,
      },
    },
    update: {
      claimedAmount: { increment: 1 },
    },
    create: {
      fid,
      voucherId,
      claimedAmount: 1,
    },
  });
};
