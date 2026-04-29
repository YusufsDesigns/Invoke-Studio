"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { FieldBuilder, type FieldSchema } from "@/components/dashboard/field-builder";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "WRITING", label: "Writing" },
  { value: "LEGAL", label: "Legal" },
  { value: "CODE", label: "Code" },
  { value: "BUSINESS", label: "Business" },
  { value: "RESEARCH", label: "Research" },
  { value: "FINANCE", label: "Finance" },
];

export default function EditToolPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.50");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [exampleOutput, setExampleOutput] = useState("");
  const [fields, setFields] = useState<FieldSchema[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/tools/${id}`)
      .then((r) => r.json())
      .then((tool) => {
        setName(tool.name ?? "");
        setCategory(tool.category ?? "");
        setDescription(tool.description ?? "");
        setPrice(String(tool.priceUsdc ?? 0.5));
        setSystemPrompt(tool.systemPrompt ?? "");
        setExampleOutput(tool.exampleOutput ?? "");
        setFields((tool.inputSchema as FieldSchema[]) ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tool");
        setLoading(false);
      });
  }, [id]);

  const isValid =
    name.trim() &&
    category &&
    description.trim() &&
    parseFloat(price) >= 0.10 &&
    systemPrompt.trim().length >= 50 &&
    fields.length >= 1;

  const save = (publish?: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        const body: Record<string, unknown> = {
          name: name.trim(),
          category,
          description: description.trim(),
          priceUsdc: parseFloat(price),
          systemPrompt: systemPrompt.trim(),
          inputSchema: fields,
          exampleOutput: exampleOutput.trim() || null,
        };
        if (publish !== undefined) body.isPublished = publish;

        const res = await fetch(`/api/dashboard/tools/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to update tool");
          return;
        }
        router.push("/dashboard/tools");
        router.refresh();
      } catch {
        setError("Something went wrong.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Edit Tool</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Basics</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tool Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={300}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per Run (USDC)</label>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0.10} step={0.05}
                className="w-full rounded-lg border border-gray-200 pl-7 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">USDC</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Example Output</label>
            <textarea value={exampleOutput} onChange={(e) => setExampleOutput(e.target.value)} rows={4} maxLength={1000}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400 font-mono" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">System Prompt</h2>
            <p className="text-xs text-gray-400 mt-1">Never shown to buyers.</p>
          </div>
          <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={10}
            className={cn("w-full rounded-lg border px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400 font-mono",
              systemPrompt.length < 50 ? "border-amber-300" : "border-gray-200")} />
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Input Fields</h2>
          <FieldBuilder fields={fields} onChange={setFields} />
        </section>

        <div className="flex items-center gap-3 pb-8">
          <button onClick={() => save()} disabled={!isValid || pending}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all">
            {pending ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={() => router.back()}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
