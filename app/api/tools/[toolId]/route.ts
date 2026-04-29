import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/tools/[toolId]
// Public — agents use this to discover a tool's schema before running it.
// Returns name, description, priceUsdc, and the inputSchema (field labels + types).
// Never exposes systemPrompt.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  const { toolId } = await params;

  const tool = await db.tool.findUnique({
    where: { id: toolId, isPublished: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      priceUsdc: true,
      inputSchema: true,
      runCount: true,
    },
  });

  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  return NextResponse.json(tool);
}
