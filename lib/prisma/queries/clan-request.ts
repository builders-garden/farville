import { prisma } from "../client";

export function createClanRequest(requestId: string, clanId: string) {
  return prisma.clanRequest.create({
    data: {
      requestId,
      clanId,
    },
  });
}
