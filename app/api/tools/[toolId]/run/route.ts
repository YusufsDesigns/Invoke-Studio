import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/locus";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const { toolId } = await params;
    const body = await req.json();

    let tool;
    try {
      tool = await db.tool.findUnique({ where: { id: toolId, isPublished: true } });
    } catch (e) {
      console.error("[run] DB error finding tool:", e);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

    const schema = tool.inputSchema as Array<{ id: string; required: boolean }>;
    const inputs = body.inputs ?? {};
    for (const field of schema) {
      if (field.required && !inputs[field.id]?.trim()) {
        return NextResponse.json(
          { error: `Field "${field.id}" is required` },
          { status: 400 }
        );
      }
    }

    let run;
    try {
      run = await db.run.create({
        data: {
          toolId: tool.id,
          locusSessionId: `pending_${Date.now()}`,
          webhookSecret: "",
          inputData: inputs,
          status: "PENDING",
        },
      });
    } catch (e) {
      console.error("[run] DB error creating run:", e);
      return NextResponse.json({ error: "Failed to create run" }, { status: 500 });
    }

    let session;
    try {
      session = await createCheckoutSession({
        toolId: tool.id,
        toolSlug: tool.slug,
        runId: run.id,
        toolName: tool.name,
        priceUsdc: tool.priceUsdc,
      });
    } catch (e) {
      console.error("[run] Locus checkout error:", e);
      await db.run.delete({ where: { id: run.id } }).catch(() => {});
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Payment setup failed" },
        { status: 500 }
      );
    }

    await db.run.update({
      where: { id: run.id },
      data: {
        locusSessionId: session.sessionId,
        webhookSecret: session.webhookSecret,
      },
    });

    return NextResponse.json({
      runId: run.id,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      expiresAt: session.expiresAt,
    });
  } catch (e) {
    console.error("[run] Unexpected error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
