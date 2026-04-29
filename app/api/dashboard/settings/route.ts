import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { payoutEmail } = await req.json();
  if (!payoutEmail)
    return NextResponse.json({ error: "Payout email required" }, { status: 400 });

  await db.user.update({
    where: { id: session.user.id },
    data: { payoutEmail },
  });

  return NextResponse.json({ success: true });
}
