require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

async function main() {
  console.log("Connecting to Supabase PG Pooler...");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Migrating journey stages...");

  const oldToNew = {
    "1. Phá băng": "1. Phá băng và tư vấn ban đầu",
    "2. Tư vấn": "2. Tư vấn chuyên sâu lần 1",
    "3. Khảo sát": "3. Xây dựng lòng tin",
    "4. Hẹn gặp": "4. Hẹn gặp khách",
    "5. Dồn chốt": "5. Dồn Chốt",
    "6. Chốt Deal": "6. Chốt Cọc",
    // Also catch some variants
    "1. Phá băng và làm rõ nhu cầu": "1. Phá băng và tư vấn ban đầu",
    "2. Tư vấn sản phẩm": "2. Tư vấn chuyên sâu lần 1",
    "3. Gửi thông tin sơ bộ": "3. Xây dựng lòng tin",
    "4. Hẹn gặp/xem": "4. Hẹn gặp khách",
  };

  const customers = await prisma.customer.findMany({
    select: { id: true, journeyStage: true }
  });

  let count = 0;
  for (const c of customers) {
    if (oldToNew[c.journeyStage]) {
      await prisma.customer.update({
        where: { id: c.id },
        data: { journeyStage: oldToNew[c.journeyStage] }
      });
      count++;
    }
  }

  console.log(`Migrated ${count} customers.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
