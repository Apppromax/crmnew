import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert Profile
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
      },
      create: {
        id: user.id,
        email: user.email,
        role: "user",
        balance: 0,
        isPro: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
