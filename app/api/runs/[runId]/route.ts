import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;
  const run = await db.run.findUnique({
    where: { id: runId },
    select: {
      id: true,
      status: true,
      result: true,
      txHash: true,
      createdAt: true,
      completedAt: true,
    },
  });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(run);
}
