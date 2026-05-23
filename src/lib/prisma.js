import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    min: 2,                      // Giữ ít nhất 2 connection sẵn sàng, tránh cold start
    max: 10,
    connectionTimeoutMillis: 5000, // Fail fast nếu không connect được trong 5s
    idleTimeoutMillis: 30000,      // Giữ connection idle 30s trước khi đóng
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
