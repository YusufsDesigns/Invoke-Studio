import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tool = await db.tool.findFirst({
    where: { id, creatorId: session.user.id },
  });
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tool = await db.tool.findFirst({
    where: { id, creatorId: session.user.id },
  });
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, category, description, priceUsdc, systemPrompt, inputSchema, exampleOutput, isPublished } = body;

  const updated = await db.tool.update({
    where: { id },
    data: {
      name: name ?? tool.name,
      category: category ?? tool.category,
      description: description ?? tool.description,
      priceUsdc: priceUsdc != null ? parseFloat(priceUsdc) : tool.priceUsdc,
      systemPrompt: systemPrompt ?? tool.systemPrompt,
      inputSchema: inputSchema ?? tool.inputSchema,
      exampleOutput: exampleOutput !== undefined ? exampleOutput : tool.exampleOutput,
      isPublished: isPublished !== undefined ? isPublished : tool.isPublished,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tool = await db.tool.findFirst({
    where: { id, creatorId: session.user.id },
  });
  if (!tool) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.tool.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
