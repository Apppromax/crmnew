require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { fullName: { contains: 'tuanlinh', mode: 'insensitive' } },
        { fullName: { contains: 'hoang', mode: 'insensitive' } },
        { email: { contains: 'tuanlinh', mode: 'insensitive' } },
        { email: { contains: 'hoang', mode: 'insensitive' } }
      ]
    },
    include: {
      ownedTeam: {
        include: { 
          members: { include: { user: true } }, 
          customers: true 
        }
      },
      teamMembership: {
        include: { team: { include: { members: true, customers: true } } }
      },
      customers: true
    }
  });

  if (!profile) {
    console.log("No profile found.");
    return;
  }

  console.log("Profile:", profile.id, profile.email, profile.fullName);
  
  if (profile.ownedTeam) {
    console.log("--- OWNED TEAM ---");
    console.log("Team Name:", profile.ownedTeam.name);
    console.log("Team ID:", profile.ownedTeam.id);
    console.log("Members count:", profile.ownedTeam.members.length);
    console.log("Members:", profile.ownedTeam.members.map(m => m.user.email).join(", "));
    console.log("Team Customers count:", profile.ownedTeam.customers.length);
  } else {
    console.log("--- NO OWNED TEAM ---");
  }
  
  if (profile.teamMembership) {
    console.log("--- TEAM MEMBERSHIP ---");
    console.log("Member of team:", profile.teamMembership.team.name);
  } else {
    console.log("--- NO TEAM MEMBERSHIP ---");
  }
  
  console.log("Total personal customers:", profile.customers.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
