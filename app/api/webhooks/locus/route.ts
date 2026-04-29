import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature, executeToolWithClaude } from "@/lib/locus";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-signature-256") ?? "";
  const event = req.headers.get("x-webhook-event") ?? "";

  if (event !== "checkout.session.paid") return NextResponse.json({ ok: true });

  let body: {
    data?: {
      metadata?: { runId?: string };
      paymentTxHash?: string;
      payerAddress?: string;
    };
  };
  try {
    body = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const runId = body?.data?.metadata?.runId;
  const txHash = body?.data?.paymentTxHash;
  const payerAddress = body?.data?.payerAddress;

  if (!runId)
    return NextResponse.json({ error: "No runId in metadata" }, { status: 400 });

  const run = await db.run.findUnique({
    where: { id: runId },
    include: { tool: { include: { creator: true } } },
  });

  if (!run || run.status !== "PENDING") return NextResponse.json({ ok: true });

  if (!verifyWebhookSignature(payload, signature, run.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  await db.run.update({
    where: { id: runId },
    data: { status: "PAID", payerAddress, txHash },
  });

  const schema = run.tool.inputSchema as Array<{ id: string; label: string }>;
  const inputData = run.inputData as Record<string, string>;
  const userInput = schema
    .map((f) => `${f.label}:\n${inputData[f.id] ?? ""}`)
    .join("\n\n---\n\n");

  // Retry AI up to 3 times — transient errors (rate limits, timeouts) are common
  let result: string | null = null;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result = await executeToolWithClaude({
        systemPrompt: run.tool.systemPrompt,
        userInput,
      });
      break;
    } catch (err) {
      lastError = err;
      console.error(`[webhook] AI attempt ${attempt}/3 failed:`, err);
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }

  if (result) {
    await db.$transaction([
      db.run.update({
        where: { id: runId },
        data: { result, status: "COMPLETED", completedAt: new Date() },
      }),
      db.tool.update({
        where: { id: run.tool.id },
        data: { runCount: { increment: 1 } },
      }),
      db.earning.create({
        data: {
          creatorId: run.tool.creator.id,
          runId: run.id,
          amountUsdc: parseFloat((run.tool.priceUsdc * 0.8).toFixed(6)),
          status: "PENDING",
        },
      }),
    ]);
  } else {
    console.error("[webhook] All AI attempts failed:", lastError);
    await db.run.update({ where: { id: runId }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ ok: true });
}
