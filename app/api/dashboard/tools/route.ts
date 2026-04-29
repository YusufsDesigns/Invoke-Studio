import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tools = await db.tool.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tools);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, category, description, priceUsdc, systemPrompt, inputSchema, exampleOutput } = body;

  if (!name || !category || !description || !priceUsdc || !systemPrompt || !inputSchema?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await db.tool.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const tool = await db.tool.create({
    data: {
      creatorId: session.user.id,
      name,
      slug,
      category,
      description,
      priceUsdc: parseFloat(priceUsdc),
      systemPrompt,
      inputSchema,
      exampleOutput: exampleOutput || null,
      isPublished: body.publish === true,
    },
  });

  return NextResponse.json(tool, { status: 201 });
}
