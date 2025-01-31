import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

Object.defineProperty(BigInt.prototype, "toJSON", {
  get() {
    "use strict";
    return () => String(this);
  },
  configurable: true,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma || new PrismaClient();
  
  // Test the connection
  await prisma.$connect();
  console.log('Successfully connected to database');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
export default prisma;
