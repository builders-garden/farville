import { prisma } from "../client";
import { DbItem } from "../types";

export const getItems = async (category?: string): Promise<DbItem[]> => {
  const items = await prisma.item.findMany({
    where: category ? { category } : undefined,
    orderBy: [
      { requiredLevel: "asc" },
      { buyPrice: "asc" },
      { sellPrice: "asc" },
    ],
  });

  return items;
};

export const getItemById = async (itemId: number): Promise<DbItem | null> => {
  const item = await prisma.item.findUnique({
    where: {
      id: itemId,
    },
  });

  return item;
};

export const getItemsByCategory = async (
  category: string
): Promise<DbItem[]> => {
  const items = await prisma.item.findMany({
    where: {
      category,
    },
    orderBy: {
      requiredLevel: "asc",
    },
  });

  return items;
};

export const getItemBySlug = async (slug: string): Promise<DbItem | null> => {
  const item = await prisma.item.findUnique({
    where: {
      slug,
    },
  });

  return item;
};
