import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { executeToolWithClaude } from "@/lib/locus";

// POST /api/runs/[runId]/retry
// Free re-execution for runs that were paid but the AI failed.
// Does NOT create a new checkout session — payment already happened.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  const run = await db.run.findUnique({
    where: { id: runId },
    include: { tool: { include: { creator: true } } },
  });

  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Must have been paid — no txHash means payment was never confirmed
  if (!run.txHash) {
    return NextResponse.json(
      { error: "This run was never paid — start a new run" },
      { status: 400 }
    );
  }

  // Only retry FAILED runs (or PAID runs stuck without a result)
  if (run.status !== "FAILED" && run.status !== "PAID") {
    return NextResponse.json(
      { error: "Run is not retryable" },
      { status: 400 }
    );
  }

  // Mark as PAID so the polling UI shows the processing spinner
  await db.run.update({ where: { id: runId }, data: { status: "PAID" } });

  const schema = run.tool.inputSchema as Array<{ id: string; label: string }>;
  const inputData = run.inputData as Record<string, string>;
  const userInput = schema
    .map((f) => `${f.label}:\n${inputData[f.id] ?? ""}`)
    .join("\n\n---\n\n");

  try {
    const result = await executeToolWithClaude({
      systemPrompt: run.tool.systemPrompt,
      userInput,
    });

    await db.$transaction([
      db.run.update({
        where: { id: runId },
        data: { result, status: "COMPLETED", completedAt: new Date() },
      }),
      db.tool.update({
        where: { id: run.tool.id },
        data: { runCount: { increment: 1 } },
      }),
      // Use upsert in case a partial earning record exists
      db.earning.upsert({
        where: { runId: run.id },
        update: { status: "PENDING" },
        create: {
          creatorId: run.tool.creator.id,
          runId: run.id,
          amountUsdc: parseFloat((run.tool.priceUsdc * 0.8).toFixed(6)),
          status: "PENDING",
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[retry] AI execution failed:", err);
    await db.run.update({ where: { id: runId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "AI execution failed" }, { status: 500 });
  }
}
