import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const dummyProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return dummyProxy;
  }
});

const isRealDb = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.startsWith("postgres");

export const prisma = isRealDb
  ? (globalForPrisma.prisma || new PrismaClient())
  : (dummyProxy as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
