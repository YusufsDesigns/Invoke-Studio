import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PublishToggle } from "./publish-toggle";
import { Plus, Pencil, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolCategory = "WRITING" | "LEGAL" | "CODE" | "BUSINESS" | "RESEARCH" | "FINANCE";

const categoryConfig: Record<ToolCategory, { label: string; className: string }> = {
  WRITING:  { label: "Writing",  className: "bg-violet-100 text-violet-700" },
  LEGAL:    { label: "Legal",    className: "bg-amber-100 text-amber-700" },
  CODE:     { label: "Code",     className: "bg-cyan-100 text-cyan-700" },
  BUSINESS: { label: "Business", className: "bg-blue-100 text-blue-700" },
  RESEARCH: { label: "Research", className: "bg-emerald-100 text-emerald-700" },
  FINANCE:  { label: "Finance",  className: "bg-green-100 text-green-700" },
};

export default async function MyToolsPage() {
  const session = await auth();
  const tools = await db.tool.findMany({
    where: { creatorId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Tools</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {tools.length} tool{tools.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/tools/new"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Tool
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No tools yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            Create your first AI tool and start earning from every run.
          </p>
          <Link
            href="/dashboard/tools/new"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Your First Tool
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">
                  Tool
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">
                  Runs
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tools.map((tool) => {
                const cat = categoryConfig[tool.category as ToolCategory];
                return (
                  <tr key={tool.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {tool.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", cat.className)}>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 hidden sm:table-cell">
                      ${tool.priceUsdc.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {tool.runCount}
                    </td>
                    <td className="px-5 py-4">
                      <PublishToggle toolId={tool.id} isPublished={tool.isPublished} />
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/tools/${tool.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
