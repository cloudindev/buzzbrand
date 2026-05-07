import { PrismaClient } from "@prisma/client"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const isRealDb = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.startsWith("postgres");

let adapter;
if (isRealDb) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  adapter = new PrismaPg(pool)
}

const dummyProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return dummyProxy;
  }
});

export const prisma = isRealDb
  ? (globalForPrisma.prisma || new PrismaClient({ adapter }))
  : (dummyProxy as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
