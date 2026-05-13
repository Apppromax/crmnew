require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Bắt đầu migrate dữ liệu heatLevel và status...");

    const heatMappings = {
      "Rất nét": "Rất Nét",
      "Tiềm năng": "Tiềm Năng",
      "Đang tìm hiểu": "Quan Tâm",
      "Mờ": "Tham Khảo",
      "Hot": "Rất Nét",
      "Warm": "Tiềm Năng",
      "Cold": "Chưa Rõ",
    };

    let heatUpdated = 0;
    for (const [oldHeat, newHeat] of Object.entries(heatMappings)) {
      const res = await prisma.customer.updateMany({
        where: { heatLevel: oldHeat },
        data: { heatLevel: newHeat }
      });
      heatUpdated += res.count;
      console.log(`- Đã cập nhật ${res.count} khách từ '${oldHeat}' -> '${newHeat}'`);
    }
    
    const statusMappings = {
      "New": "Mới",
      "Active": "Đang chăm",
      "Waiting": "Đang chờ",
      "Dormant": "Ngủ đông",
      "Closed": "Đã chốt",
      "Lost": "Mất khách"
    };

    let statusUpdated = 0;
    for (const [oldStatus, newStatus] of Object.entries(statusMappings)) {
      const res = await prisma.customer.updateMany({
        where: { status: oldStatus },
        data: { status: newStatus }
      });
      statusUpdated += res.count;
      console.log(`- Đã cập nhật ${res.count} khách từ '${oldStatus}' -> '${newStatus}'`);
    }

    console.log(`Migrate thành công! Cập nhật ${heatUpdated} records (heatLevel) và ${statusUpdated} records (status).`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
