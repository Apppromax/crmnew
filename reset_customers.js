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
    const userId = 'df29a0a4-19a6-4da9-8faa-213e3fff39be'; // tuanlinh.hoang28@gmail.com
    
    const deleted = await prisma.customer.deleteMany({
      where: {
        userId: userId
      }
    });
    
    console.log(`Đã xóa ${deleted.count} khách hàng của user tuanlinh.hoang28@gmail.com`);
    
    const mockCustomers = [
      { name: "Khách VIP 1", phone: "0901111111", status: "Mới", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId },
      { name: "Khách Hàng 2", phone: "0902222222", status: "Mới", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId },
      { name: "Anh Tuấn 3", phone: "0903333333", status: "Mới", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId },
      { name: "Chị Lan 4", phone: "0904444444", status: "Mới", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId },
      { name: "Chú Bình 5", phone: "0905555555", status: "Mới", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId },
      
      { name: "Cô Hoa Quận 7", phone: "0906666666", status: "Đang chăm", journeyStage: "4. Hẹn gặp/xem", clarityScore: 85, heatLevel: "Rất Nét", userId, nextFollowUp: new Date(Date.now() + 86400000) },
      { name: "Em Duy IT", phone: "0907777777", status: "Đang chăm", journeyStage: "3. Gửi thông tin sơ bộ", clarityScore: 60, heatLevel: "Tiềm Năng", userId, nextFollowUp: new Date(Date.now() + 172800000) },
      { name: "Bác Dũng Đầu Tư", phone: "0908888888", status: "Ngủ đông", journeyStage: "2. Tư vấn sản phẩm", clarityScore: 40, heatLevel: "Quan Tâm", userId },
      { name: "Chị Oanh Xem Giá", phone: "0909999999", status: "Mất khách", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 20, heatLevel: "Tham Khảo", userId },
      { name: "Số Máy Lạ", phone: "0910000000", status: "Chưa liên lạc được", journeyStage: "1. Phá băng và làm rõ nhu cầu", clarityScore: 0, heatLevel: "Chưa Rõ", userId }
    ];
    
    await prisma.customer.createMany({
      data: mockCustomers
    });
    
    console.log("Đã tạo 5 khách hàng mẫu thành công cho tuanlinh.hoang28@gmail.com.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
