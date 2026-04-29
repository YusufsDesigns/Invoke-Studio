import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ToolCard } from "@/components/marketplace/tool-card";
import { CategoryFilter } from "@/components/marketplace/category-filter";
import { Footer } from "@/components/landing/footer";
import type { ToolCategory } from "@/generated/prisma/client";

const VALID_CATEGORIES: ToolCategory[] = [
  "WRITING", "LEGAL", "CODE", "BUSINESS", "RESEARCH", "FINANCE",
];

async function ToolGrid({ category }: { category?: string }) {
  const where = {
    isPublished: true,
    ...(category && VALID_CATEGORIES.includes(category as ToolCategory)
      ? { category: category as ToolCategory }
      : {}),
  };

  type ToolWithCreator = Awaited<ReturnType<typeof db.tool.findMany<{ include: { creator: { select: { name: true; image: true } } } }>>>;
  let tools: ToolWithCreator = [];
  try {
    tools = await db.tool.findMany({
      where,
      orderBy: { runCount: "desc" },
      include: { creator: { select: { name: true, image: true } } },
    });
  } catch {
    // DB connection error — show empty state
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">No tools found in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Invoke Studio" width={22} height={22} className="rounded-md" />
            <span className="font-semibold text-gray-900 text-sm">Invoke Studio</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
            AI Tools Marketplace
          </h1>
          <p className="text-gray-500 text-sm">
            Pay per run. Results in seconds.
          </p>
        </div>

        <div className="mb-8">
          <Suspense>
            <CategoryFilter />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          }
        >
          <ToolGrid category={category} />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
}
