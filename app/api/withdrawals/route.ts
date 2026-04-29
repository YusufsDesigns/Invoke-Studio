import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCreatorPayout } from "@/lib/locus";

export async function POST(req: NextRequest) {
  void req;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const pendingEarnings = await db.earning.findMany({
    where: { creatorId: userId, status: "PENDING" },
  });
  if (pendingEarnings.length === 0)
    return NextResponse.json({ error: "No pending earnings" }, { status: 400 });

  const totalAmount = pendingEarnings.reduce((sum, e) => sum + e.amountUsdc, 0);
  const user = await db.user.findUnique({ where: { id: userId } });
  const payoutEmail = user?.payoutEmail ?? user?.email ?? '';

  const withdrawal = await db.withdrawal.create({
    data: {
      creatorId: userId,
      totalAmountUsdc: parseFloat(totalAmount.toFixed(6)),
      payoutEmail,
      status: "PROCESSING",
      earnings: { connect: pendingEarnings.map((e) => ({ id: e.id })) },
    },
  });

  await db.earning.updateMany({
    where: { id: { in: pendingEarnings.map((e) => e.id) } },
    data: { status: "WITHDRAWN", withdrawalId: withdrawal.id },
  });

  try {
    const txId = await sendCreatorPayout({
      payoutEmail,
      amountUsdc: totalAmount,
      creatorName: user?.name ?? payoutEmail,
    });
    await db.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "SENT", locusTransactionId: txId },
    });
    return NextResponse.json({
      success: true,
      transactionId: txId,
      amount: totalAmount,
    });
  } catch (err) {
    await db.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED" },
    });
    console.error("Payout failed:", err);
    return NextResponse.json({ error: "Payout failed" }, { status: 500 });
  }
}
