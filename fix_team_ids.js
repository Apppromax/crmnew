const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all team members
  const members = await prisma.teamMember.findMany();
  
  let updatedCount = 0;
  for (const member of members) {
    // Update customers belonging to this member where teamId is null
    const result = await prisma.customer.updateMany({
      where: {
        userId: member.userId,
        teamId: null
      },
      data: {
        teamId: member.teamId
      }
    });
    
    updatedCount += result.count;
  }
  
  console.log(`Successfully updated ${updatedCount} old customers with missing teamId.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
