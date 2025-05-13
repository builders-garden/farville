import { Item } from "@prisma/client";
import { prisma } from "../client";

export const getItems = async (category?: string): Promise<Item[]> => {
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

export const getItemById = async (itemId: number): Promise<Item | null> => {
  const item = await prisma.item.findUnique({
    where: {
      id: itemId,
    },
  });

  return item;
};

export const getItemsByCategory = async (category: string): Promise<Item[]> => {
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

export const getItemBySlug = async (slug: string): Promise<Item | null> => {
  const item = await prisma.item.findUnique({
    where: {
      slug,
    },
  });

  return item;
};
