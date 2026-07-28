import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

if (!globalThis.prismaGlobal || !(globalThis.prismaGlobal as any).followedEntity) {
  globalThis.prismaGlobal = prismaClientSingleton()
}

const prisma = globalThis.prismaGlobal

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

