import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { RunPanel } from "@/components/tool/run-panel";
import { Footer } from "@/components/landing/footer";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type ToolCategory = "WRITING" | "LEGAL" | "CODE" | "BUSINESS" | "RESEARCH" | "FINANCE";

const categoryConfig: Record<ToolCategory, { label: string; className: string }> = {
  WRITING:  { label: "Writing",  className: "bg-violet-100 text-violet-700" },
  LEGAL:    { label: "Legal",    className: "bg-amber-100 text-amber-700" },
  CODE:     { label: "Code",     className: "bg-cyan-100 text-cyan-700" },
  BUSINESS: { label: "Business", className: "bg-blue-100 text-blue-700" },
  RESEARCH: { label: "Research", className: "bg-emerald-100 text-emerald-700" },
  FINANCE:  { label: "Finance",  className: "bg-green-100 text-green-700" },
};

type FieldSchema = {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  charLimit?: number;
  required: boolean;
};

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let tool;
  try {
    tool = await db.tool.findUnique({
      where: { slug, isPublished: true },
      include: { creator: { select: { name: true, image: true } } },
    });
  } catch {
    notFound();
  }

  if (!tool) notFound();

  const cat = categoryConfig[tool.category as ToolCategory];
  const inputSchema = tool.inputSchema as FieldSchema[];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Invoke Studio" width={22} height={22} className="rounded-md" />
            <span className="font-semibold text-gray-900 text-sm">Invoke Studio</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/marketplace" className="hover:text-gray-700 transition-colors">
            Marketplace
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", cat.className)}>
            {cat.label}
          </span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 truncate max-w-[200px]">{tool.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Left panel */}
          <div className="space-y-6">
            <div>
              <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mb-3", cat.className)}>
                {cat.label}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-3">
                {tool.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                {tool.creator.image ? (
                  <Image
                    src={tool.creator.image}
                    alt={tool.creator.name ?? ""}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex-none" />
                )}
                <span className="text-xs text-gray-400">
                  by {tool.creator.name ?? "Anonymous"}
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400">{tool.runCount} runs</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{tool.description}</p>
            </div>

            {tool.exampleOutput && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Example Output</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono overflow-auto max-h-64">
                    {tool.exampleOutput}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">What you&apos;ll need to provide</h2>
              <ul className="space-y-2">
                {inputSchema.map((field) => (
                  <li key={field.id} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-none" />
                    <span className="font-medium">{field.label}</span>
                    {field.required ? (
                      <span className="text-xs text-gray-400 ml-auto">Required</span>
                    ) : (
                      <span className="text-xs text-gray-300 ml-auto">Optional</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                Constraints
              </p>
              <ul className="space-y-1.5 text-xs text-gray-500">
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-none" />Text input only — no file uploads</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-none" />No live web data or real-time search</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-none" />No code execution — tools can generate code, not run it</li>
                <li className="flex items-start gap-2"><span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 flex-none" />No memory between runs — each run is independent</li>
              </ul>
            </div>
          </div>

          {/* Right panel — RunPanel */}
          <div className="lg:sticky lg:top-20">
            <RunPanel
              toolId={tool.id}
              toolName={tool.name}
              priceUsdc={tool.priceUsdc}
              inputSchema={inputSchema}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
