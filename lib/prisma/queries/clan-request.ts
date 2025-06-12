import { prisma } from "../client";

export function createClanRequest(request: {
  requestId?: string;
  clanId: string;
  fid: number;
  itemId?: number;
  quantity?: number;
}) {
  return prisma.clanRequest.create({
    data: {
      requestId: request.requestId,
      clanId: request.clanId,
      fid: request.fid,
      itemId: request.itemId,
      quantity: request.quantity,
    },
  });
}

export function deleteClanRequestsByFid(clanId: string, fid: number) {
  return prisma.clanRequest.deleteMany({
    where: {
      clanId,
      request: {
        fid,
      },
    },
  });
}
