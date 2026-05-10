import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const seedData = [
  {
    name: "Nguyễn Văn Hùng", phone: "0901 234 567", status: "Active",
    budget: "2-3 tỷ", demand: "Căn hộ 2PN view sông", area: "Quận 7",
    timeline: "Quý 3/2026", finance: "Vay 70%",
    clarityScore: 85, heatLevel: "Hot",
    nextFollowUp: new Date(Date.now() - 2 * 86400000),
    lastContactAt: new Date(Date.now() - 3 * 86400000),
    journeyStage: "Viewed",
  },
  {
    name: "Trần Thị Mai Anh", phone: "0938 765 432", status: "Active",
    budget: "5-7 tỷ", demand: "Nhà phố 3 tầng", area: "Thủ Đức",
    timeline: "Trong tháng", finance: "Tiền mặt",
    clarityScore: 72, heatLevel: "Hot",
    nextFollowUp: new Date(Date.now() + 3600000),
    lastContactAt: new Date(Date.now() - 86400000),
    journeyStage: "Negotiating",
  },
  {
    name: "Lê Hoàng Nam", phone: "0912 345 678", status: "New",
    budget: "1-2 tỷ", demand: "Căn hộ studio", area: "Bình Thạnh",
    timeline: "Quý 4/2026",
    clarityScore: 45, heatLevel: "Warm",
    nextFollowUp: new Date(Date.now() + 18 * 3600000),
    lastContactAt: new Date(Date.now() - 5 * 86400000),
    journeyStage: "Lead",
  },
  {
    name: "Phạm Minh Đức", phone: "0908 111 222", status: "Waiting",
    budget: "3-4 tỷ", demand: "Biệt thự mini", area: "Quận 9",
    timeline: "Quý 2/2026", finance: "Vay 50%",
    clarityScore: 60, heatLevel: "Warm",
    nextFollowUp: new Date(Date.now() + 2 * 86400000),
    lastContactAt: new Date(Date.now() - 7 * 86400000),
    journeyStage: "Contacted",
  },
  {
    name: "Võ Thị Hồng", phone: "0977 888 999", status: "Active",
    demand: "Đất nền", area: "Long An",
    clarityScore: 25, heatLevel: "Cold",
    nextFollowUp: new Date(Date.now() + 7 * 86400000),
    lastContactAt: new Date(Date.now() - 14 * 86400000),
    journeyStage: "Lead",
  },
];

async function main() {
  console.log("🌱 Seeding...");
  for (const data of seedData) {
    await prisma.customer.create({ data });
    console.log(`  ✅ ${data.name}`);
  }
  console.log("🎉 Done!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
