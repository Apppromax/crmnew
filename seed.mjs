import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const vFirstNames = ["Anh", "Tuấn", "Linh", "Hải", "Sơn", "Hoàng", "Minh", "Hưng", "Duy", "Long", "Quân", "Bảo", "Nam", "Việt", "Đức", "Tùng", "Phúc", "Thành", "Hiếu", "Cường", "Trang", "Hương", "Lan", "Phương", "Thảo", "Nhung", "Ngọc", "Mai", "Oanh", "Yến", "My", "Vy", "Hà", "Thu", "Ngân", "Hoa"];
const vLastNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];

const heatLevels = ["Chưa Rõ", "Tham Khảo", "Quan Tâm", "Tiềm Năng", "Rất Nét"];
const journeyStages = ["1. Phá băng", "2. Tư vấn", "3. Khảo sát", "4. Hẹn gặp", "5. Dồn chốt", "6. Chốt Deal"];
const statuses = ["Mới", "Đang chăm", "Đang chờ", "Ngủ đông", "Đã chốt", "Mất khách"];
const budgets = ["Dưới 2 tỷ", "2 - 5 tỷ", "5 - 10 tỷ", "Trên 10 tỷ", "Đang gom vốn", "Vay ngân hàng 50%"];
const demands = ["Đầu tư lướt sóng", "Mua để ở", "Đầu tư dài hạn", "Cho thuê dòng tiền", "Tìm đất nền", "Tìm chung cư"];
const areas = ["Cầu Giấy", "Nam Từ Liêm", "Tây Hồ", "Đống Đa", "Hà Đông", "Gia Lâm", "Long Biên"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function main() {
  console.log("Tìm tài khoản chientran64 và tuanlinh.hoang28...");
  const chien = await prisma.profile.findUnique({ where: { email: 'chientran64@gmail.com' } });
  const linh = await prisma.profile.findUnique({ where: { email: 'tuanlinh.hoang28@gmail.com' } });

  if (!chien || !linh) {
    console.log("Không tìm thấy 2 tài khoản quản lý!");
    return;
  }

  // Cấp quyền maxMembers lên 30 cho rộng rãi
  console.log("Cập nhật/Tạo Team...");
  const teamChien = await prisma.team.upsert({
    where: { ownerId: chien.id },
    update: { maxMembers: 30, isActive: true },
    create: {
      name: "Biệt Đội Chiến Thần",
      inviteCode: "CHIEN-9999",
      ownerId: chien.id,
      isActive: true,
      maxMembers: 30,
    }
  });

  const teamLinh = await prisma.team.upsert({
    where: { ownerId: linh.id },
    update: { maxMembers: 30, isActive: true },
    create: {
      name: "Team Vua Tốc Độ",
      inviteCode: "LINH-8888",
      ownerId: linh.id,
      isActive: true,
      maxMembers: 30,
    }
  });

  // Đảm bảo owner nằm trong teamMember
  await prisma.teamMember.upsert({
    where: { userId: chien.id },
    update: { teamId: teamChien.id, role: 'LEADER' },
    create: { teamId: teamChien.id, userId: chien.id, role: 'LEADER' }
  });
  await prisma.teamMember.upsert({
    where: { userId: linh.id },
    update: { teamId: teamLinh.id, role: 'LEADER' },
    create: { teamId: teamLinh.id, userId: linh.id, role: 'LEADER' }
  });

  console.log("Bắt đầu tạo 20 accounts sales (mỗi team 10 người)...");
  for (let t = 0; t < 2; t++) {
    const currentTeam = t === 0 ? teamChien : teamLinh;
    for (let i = 0; i < 10; i++) {
      const lname = rand(vLastNames);
      const fname = rand(vFirstNames);
      const email = `sale.${t}.${i}@crm.local`;
      const id = `fake-uuid-${t}-${i}-${Date.now()}`;

      // Tạo profile
      const profile = await prisma.profile.create({
        data: {
          id: id,
          email: email,
          fullName: `${lname} ${fname}`,
          role: 'user',
          balance: 1000
        }
      });

      // Join team
      await prisma.teamMember.create({
        data: {
          teamId: currentTeam.id,
          userId: profile.id,
          role: 'MEMBER'
        }
      });

      // Tạo 30 customers cho mỗi sale
      const customersData = [];
      for (let c = 0; c < 30; c++) {
        // Sinh ra data logic với nhau
        const st = rand(statuses);
        let hl = rand(heatLevels);
        let js = rand(journeyStages);
        
        // Logic constraint: Đã chốt -> Rất nét, Chốt deal
        if (st === 'Đã chốt') {
          hl = 'Rất Nét';
          js = '6. Chốt Deal';
        } else if (st === 'Mới') {
          hl = 'Chưa Rõ';
          js = '1. Phá băng';
        }

        // Ngày liên hệ gần nhất & tiếp theo
        const lastContact = new Date(Date.now() - rInt(0, 10) * 86400000);
        let nextFollowUp = null;
        if (st === 'Đang chăm') {
          nextFollowUp = new Date(Date.now() + rInt(-2, 5) * 86400000); // Có thể lỡ hẹn (âm)
        }

        customersData.push({
          userId: profile.id,
          teamId: currentTeam.id,
          name: `${rand(vLastNames)} ${rand(vFirstNames)} (Khách)`,
          phone: `09${rInt(10000000, 99999999)}`,
          status: st,
          budget: rand(budgets),
          demand: rand(demands),
          area: rand(areas),
          heatLevel: hl,
          journeyStage: js,
          lastContactAt: lastContact,
          nextFollowUp: nextFollowUp,
          clarityScore: rInt(20, 100),
          createdAt: new Date(Date.now() - rInt(5, 30) * 86400000), // Tạo từ vài ngày trước
        });
      }

      await prisma.customer.createMany({
        data: customersData
      });
      process.stdout.write(".");
    }
    console.log(`\nHoàn thành 10 sale cho team ${currentTeam.name}`);
  }

  console.log("Xong toàn bộ dữ liệu mẫu!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
