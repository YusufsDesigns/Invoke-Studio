import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ToolCategory = "WRITING" | "LEGAL" | "CODE" | "BUSINESS" | "RESEARCH" | "FINANCE";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ToolCategory;
  priceUsdc: number;
  runCount: number;
  creator: {
    name: string | null;
    image: string | null;
  };
}

const categoryConfig: Record<ToolCategory, { label: string; className: string }> = {
  WRITING:  { label: "Writing",  className: "bg-violet-100 text-violet-700" },
  LEGAL:    { label: "Legal",    className: "bg-amber-100 text-amber-700" },
  CODE:     { label: "Code",     className: "bg-cyan-100 text-cyan-700" },
  BUSINESS: { label: "Business", className: "bg-blue-100 text-blue-700" },
  RESEARCH: { label: "Research", className: "bg-emerald-100 text-emerald-700" },
  FINANCE:  { label: "Finance",  className: "bg-green-100 text-green-700" },
};

export function ToolCard({ tool }: { tool: Tool }) {
  const cat = categoryConfig[tool.category];

  return (
    <Link
      href={`/marketplace/${tool.slug}`}
      className="group block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
            cat.className
          )}
        >
          {cat.label}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          ${tool.priceUsdc.toFixed(2)}
          <span className="text-xs font-normal text-gray-400 ml-1">/ run</span>
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors leading-snug">
        {tool.name}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
        {tool.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {tool.creator.image ? (
            <Image
              src={tool.creator.image}
              alt={tool.creator.name ?? ""}
              width={30}
              height={30}
              className="rounded-full flex-none"
            />
          ) : (
            <div className="w-[30px] h-[30px] rounded-full bg-gray-100 flex items-center justify-center flex-none">
              <span className="text-[10px] font-semibold text-gray-500 leading-none select-none">
                {(tool.creator.name ?? "A").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-400">{tool.creator.name ?? "Anonymous"}</span>
        </div>
        <span className="text-xs text-gray-400">{tool.runCount} runs</span>
      </div>
    </Link>
  );
}
