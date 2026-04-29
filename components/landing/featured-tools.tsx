import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/marketplace/tool-card";
import { db } from "@/lib/db";

async function getFeaturedTools() {
  try {
    return await db.tool.findMany({
      where: { isPublished: true },
      take: 6,
      orderBy: { runCount: "desc" },
      include: { creator: { select: { name: true, image: true } } },
    });
  } catch {
    return [];
  }
}

export async function FeaturedTools() {
  const tools = await getFeaturedTools();

  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-3">
              Featured
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
              Ready to Run
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tools.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">
              Tools load after database is connected.{" "}
              <Link href="/marketplace" className="text-gray-600 underline">
                View marketplace →
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
