import { prisma } from "../client";
import { Item, Voucher } from "@prisma/client";

/**
 * Get a voucher by its slug
 * @param slug - The slug of the voucher
 * @returns The voucher or null if it doesn't exist
 */
export const getVoucherBySlug = async (
  slug: string
): Promise<(Voucher & { item: Item | null }) | null> => {
  const voucher = await prisma.voucher.findUnique({
    where: { slug },
    include: {
      item: true,
    },
  });

  return voucher;
};

/**
 * Get a voucher by its id
 * @param id - The id of the voucher to retrieve
 * @returns The voucher or null if it doesn't exist
 */
export const getVoucherById = async (
  id: number
): Promise<(Voucher & { item: Item | null }) | null> => {
  const voucher = await prisma.voucher.findUnique({
    where: { id },
    include: {
      item: true,
    },
  });

  return voucher;
};
