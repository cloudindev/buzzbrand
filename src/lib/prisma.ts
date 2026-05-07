import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const dummyProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return dummyProxy;
  }
});

export const prisma = process.env.DATABASE_URL
  ? (globalForPrisma.prisma || new PrismaClient())
  : (dummyProxy as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
