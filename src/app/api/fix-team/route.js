import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany();
    let updatedCount = 0;
    
    for (const member of members) {
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
    
    return Response.json({ success: true, updatedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
