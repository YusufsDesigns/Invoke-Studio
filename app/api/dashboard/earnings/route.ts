import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [earnings, runs, user] = await Promise.all([
    db.earning.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { run: { include: { tool: { select: { name: true } } } } },
    }),
    db.run.count({
      where: { tool: { creatorId: userId }, status: "COMPLETED" },
    }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  const pendingBalance = earnings
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amountUsdc, 0);

  const totalEarned = earnings.reduce((sum, e) => sum + e.amountUsdc, 0);

  return NextResponse.json({
    pendingBalance: parseFloat(pendingBalance.toFixed(2)),
    totalEarned: parseFloat(totalEarned.toFixed(2)),
    totalRuns: runs,
    earnings,
    payoutEmail: user?.payoutEmail ?? user?.email ?? "",
  });
}
