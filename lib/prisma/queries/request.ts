import { Item, Request, User } from "@prisma/client";
import { prisma } from "../client";
import { Mode } from "@/lib/types/game";

export const createRequest = async (request: {
  fid: number;
  itemId: number;
  quantity: number;
  mode: Mode;
}): Promise<Request> => {
  const data = await prisma.request.create({
    data: {
      ...request,
      filledQuantity: 0,
      mode: request.mode,
    },
  });

  return data;
};

export const getRequestById = async (
  id: number
): Promise<(Request & { item: Item | null; user: User }) | null> => {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      item: true,
      user: true,
    },
  });

  return request;
};

export const incrementRequestFilledQuantity = async (
  id: number,
  amount: number = 1
): Promise<Request> => {
  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      quantity: true,
      filledQuantity: true,
    },
  });

  const requestQuantity = request?.quantity || 1;

  if (!request) throw new Error("Request not found");

  const remainingQuantity = requestQuantity - request.filledQuantity;
  const adjustedAmount = Math.min(amount, remainingQuantity);

  const updatedRequest = await prisma.request.update({
    where: { id },
    data: {
      filledQuantity: request.filledQuantity + adjustedAmount,
    },
  });

  return updatedRequest;
};

export const deleteRequest = async (id: number): Promise<void> => {
  await prisma.request.delete({
    where: { id },
  });
};
