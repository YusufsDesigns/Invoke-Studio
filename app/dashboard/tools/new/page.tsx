"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FieldBuilder, type FieldSchema } from "@/components/dashboard/field-builder";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "WRITING", label: "Writing" },
  { value: "LEGAL", label: "Legal" },
  { value: "CODE", label: "Code" },
  { value: "BUSINESS", label: "Business" },
  { value: "RESEARCH", label: "Research" },
  { value: "FINANCE", label: "Finance" },
];

const CONSTRAINTS = [
  "Text input only — no file uploads, no image input",
  "No live web data or real-time search",
  "No code execution — tools can generate code, not run it",
  "No memory between runs — each run is fully independent",
  "No multi-step workflows within a single run",
];

export default function NewToolPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.50");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [exampleOutput, setExampleOutput] = useState("");
  const [fields, setFields] = useState<FieldSchema[]>([]);

  const isValid =
    name.trim() &&
    category &&
    description.trim() &&
    parseFloat(price) >= 0.10 &&
    systemPrompt.trim().length >= 50 &&
    fields.length >= 1;

  const save = (publish: boolean) => {
    if (!isValid) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/dashboard/tools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            category,
            description: description.trim(),
            priceUsdc: parseFloat(price),
            systemPrompt: systemPrompt.trim(),
            inputSchema: fields,
            exampleOutput: exampleOutput.trim() || null,
            publish,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to create tool");
          return;
        }
        router.push("/dashboard/tools");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Create a Tool</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Define your AI tool and publish it to the marketplace.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Basics */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Basics</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Contract Risk Scanner"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400 bg-white"
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this tool do and who is it for? Shown to buyers in the marketplace."
                rows={3}
                maxLength={300}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-300">
                {description.length}/300
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price per Run (USDC) <span className="text-red-400">*</span>
            </label>
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0.10}
                step={0.05}
                className="w-full rounded-lg border border-gray-200 pl-7 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                USDC
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimum $0.10 · You earn 80%</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Example Output (optional)
            </label>
            <div className="relative">
              <textarea
                value={exampleOutput}
                onChange={(e) => setExampleOutput(e.target.value)}
                placeholder="Paste an example of the output buyers can expect. Shown on the tool page to demonstrate quality."
                rows={4}
                maxLength={1000}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400 font-mono"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-300">
                {exampleOutput.length}/1000
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: System Prompt */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              System Prompt
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Never shown to buyers — this is your expertise. Write the instruction sent to Claude before every buyer input.
            </p>
          </div>
          <div className="relative">
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert [role]...&#10;&#10;Analyze the provided [input] and produce:&#10;&#10;## Section 1&#10;...&#10;&#10;Be direct. Use specific, actionable language."
              rows={10}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400 font-mono"
            />
            <span className={cn(
              "absolute bottom-2 right-2 text-xs",
              systemPrompt.length < 50 ? "text-amber-400" : "text-gray-300"
            )}>
              {systemPrompt.length} chars{systemPrompt.length < 50 ? " (min 50)" : ""}
            </span>
          </div>
        </section>

        {/* Section 3: Input Fields */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Define the Buyer&apos;s Input Form
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Design these fields to give Claude exactly the context it needs. Minimum 1 field required.
            </p>
          </div>
          <FieldBuilder fields={fields} onChange={setFields} />
        </section>

        {/* Section 4: Constraints */}
        <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Platform Constraints
          </h2>
          <ul className="space-y-1.5">
            {CONSTRAINTS.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 flex-none" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button
            onClick={() => save(true)}
            disabled={!isValid || pending}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
          >
            {pending ? "Publishing…" : "Publish Tool"}
          </button>
          <button
            onClick={() => save(false)}
            disabled={!isValid || pending}
            className="border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 rounded-lg px-5 py-2.5 text-sm font-medium transition-all"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
