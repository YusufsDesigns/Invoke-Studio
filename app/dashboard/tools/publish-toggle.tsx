"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function PublishToggle({
  toolId,
  isPublished,
}: {
  toolId: string;
  isPublished: boolean;
}) {
  const [published, setPublished] = useState(isPublished);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !published;
    setPublished(next);
    startTransition(async () => {
      try {
        await fetch(`/api/dashboard/tools/${toolId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: next }),
        });
      } catch {
        setPublished(!next);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
        published
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", published ? "bg-green-500" : "bg-gray-400")} />
      {published ? "Published" : "Draft"}
    </button>
  );
}
