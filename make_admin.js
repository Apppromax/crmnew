require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const firstUser = await prisma.profile.findFirst({ orderBy: { createdAt: 'asc' } });
  if (firstUser) {
    await prisma.profile.update({
      where: { id: firstUser.id },
      data: { role: 'admin' }
    });
    console.log('Successfully made ' + firstUser.email + ' an admin!');
  } else {
    console.log('No users found.');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
