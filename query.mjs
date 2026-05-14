import { prisma } from './src/lib/prisma.js';
async function main() {
  const users = await prisma.profile.findMany();
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
