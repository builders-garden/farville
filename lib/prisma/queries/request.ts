import { Item, Prisma, Request, User } from "@prisma/client";
import { prisma } from "../client";

export const createRequest = async (
  request: Prisma.RequestCreateInput
): Promise<Request> => {
  const data = await prisma.request.create({
    data: {
      ...request,
      filledQuantity: 0,
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

export const getUserRequests = async (
  fid: number
): Promise<(Request & { item: Item | null })[]> => {
  const requests = await prisma.request.findMany({
    where: { fid },
    include: {
      item: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
};

export const getAllRequests = async (): Promise<
  (Request & { item: Item | null; user: User })[]
> => {
  const requests = await prisma.request.findMany({
    include: {
      item: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
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
