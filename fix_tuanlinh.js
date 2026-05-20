require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const team = await prisma.team.findFirst({
    where: { name: 'Team Vua Tốc Độ' },
    include: { owner: true }
  });

  if (!team) {
    console.log("Team Vua Tốc Độ not found.");
    return;
  }
  
  console.log("Team:", team.name);
  console.log("Owner:", team.owner.email, team.owner.id);

  const realUser = await prisma.profile.findFirst({
    where: { email: 'tuanlinh.hoang286@gmail.com' }
  });
  
  if (realUser) {
    console.log("Real user found:", realUser.email, realUser.id);
    
    // Check if realUser is a member
    const member = await prisma.teamMember.findUnique({
      where: { userId: realUser.id }
    });
    console.log("Is member?", !!member, member ? member.role : 'N/A');
    
    if (team.ownerId !== realUser.id) {
      console.log("Updating team owner to real user...");
      
      // We must swap ownership.
      // Prisma: 1-to-1 unique between team.ownerId and profile.id
      // First, we need to temporarily set it or delete the old owner.
      // Let's just update the Team ownerId
      await prisma.team.update({
        where: { id: team.id },
        data: { ownerId: realUser.id }
      });
      
      // Update role in TeamMember to LEADER
      if (member) {
        await prisma.teamMember.update({
          where: { userId: realUser.id },
          data: { role: 'LEADER' }
        });
      } else {
        await prisma.teamMember.create({
          data: { teamId: team.id, userId: realUser.id, role: 'LEADER' }
        });
      }
      
      console.log("Successfully fixed team ownership.");
    } else {
      console.log("Ownership is already correct.");
    }
  } else {
    console.log("Real user not found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
