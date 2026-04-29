"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FieldSchema {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  charLimit?: number;
  required: boolean;
}

interface InputFormProps {
  schema: FieldSchema[];
  priceUsdc: number;
  onSubmit: (inputs: Record<string, string>) => void;
  loading?: boolean;
  initialValues?: Record<string, string>;
}

export function InputForm({
  schema,
  priceUsdc,
  onSubmit,
  loading = false,
  initialValues = {},
}: InputFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const setValue = (id: string, val: string) =>
    setValues((prev) => ({ ...prev, [id]: val }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {schema.map((field) => {
        const val = values[field.id] ?? "";
        const count = val.length;
        const limit = field.charLimit;

        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <div className="relative">
                <textarea
                  value={val}
                  onChange={(e) => setValue(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  maxLength={limit}
                  required={field.required}
                  rows={5}
                  className={cn(
                    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all",
                    limit && count > limit * 0.9 && "border-amber-300"
                  )}
                />
                {limit && (
                  <span
                    className={cn(
                      "absolute bottom-2 right-2 text-xs tabular-nums",
                      count > limit * 0.9 ? "text-amber-500" : "text-gray-300"
                    )}
                  >
                    {count.toLocaleString()} / {limit.toLocaleString()}
                  </span>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={val}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                maxLength={limit}
                required={field.required}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-all"
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.99]"
      >
        {loading ? "Starting…" : `Run for $${priceUsdc.toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-gray-400">
        No account required. Powered by Locus Checkout.
      </p>
    </form>
  );
}
