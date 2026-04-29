"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const categories = [
  { label: "All", value: "" },
  { label: "Writing", value: "WRITING" },
  { label: "Legal", value: "LEGAL" },
  { label: "Code", value: "CODE" },
  { label: "Business", value: "BUSINESS" },
  { label: "Research", value: "RESEARCH" },
  { label: "Finance", value: "FINANCE" },
];

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => setCategory(cat.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            active === cat.value
              ? "bg-gray-900 text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
