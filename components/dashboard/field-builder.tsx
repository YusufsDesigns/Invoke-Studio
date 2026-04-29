"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldSchema {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  charLimit?: number;
  required: boolean;
}

interface FieldBuilderProps {
  fields: FieldSchema[];
  onChange: (fields: FieldSchema[]) => void;
}

const emptyForm = (): Omit<FieldSchema, "id"> => ({
  label: "",
  type: "text",
  placeholder: "",
  charLimit: 2000,
  required: true,
});

export function FieldBuilder({ fields, onChange }: FieldBuilderProps) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyForm());

  const openAdd = () => {
    setAdding(true);
    setEditing(null);
    setDraft(emptyForm());
  };

  const openEdit = (field: FieldSchema) => {
    setEditing(field.id);
    setAdding(false);
    setDraft({ ...field });
  };

  const cancelForm = () => {
    setAdding(false);
    setEditing(null);
  };

  const saveAdd = () => {
    if (!draft.label) return;
    const newField: FieldSchema = {
      ...draft,
      id: `field_${Date.now()}`,
    };
    onChange([...fields, newField]);
    setAdding(false);
    setDraft(emptyForm());
  };

  const saveEdit = () => {
    if (!draft.label || !editing) return;
    onChange(
      fields.map((f) => (f.id === editing ? { ...draft, id: f.id } : f))
    );
    setEditing(null);
  };

  const remove = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (editing === id) setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* Field list */}
      {fields.length > 0 && (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {fields.map((field) => (
            <div
              key={field.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 bg-white",
                editing === field.id && "bg-gray-50"
              )}
            >
              <GripVertical className="w-4 h-4 text-gray-300 flex-none cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {field.label}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{field.type === "textarea" ? "Long text" : "Short text"}</span>
                  {field.charLimit && field.type === "textarea" && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">{field.charLimit.toLocaleString()} chars</span>
                    </>
                  )}
                  {field.required && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">Required</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-none">
                <button
                  onClick={() => openEdit(field)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(field.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {fields.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
          <p className="text-sm text-gray-400">No fields yet</p>
          <p className="text-xs text-gray-300 mt-1">Add at least one field for buyers to fill in</p>
        </div>
      )}

      {/* Inline form for add/edit */}
      {(adding || editing) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            {adding ? "Add Field" : "Edit Field"}
          </p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="e.g. Contract Text"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, type: "text" })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
                  draft.type === "text"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                Short text
              </button>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, type: "textarea" })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
                  draft.type === "textarea"
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                Long text
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Placeholder text
            </label>
            <input
              value={draft.placeholder}
              onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
              placeholder="Helper text shown inside the field"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
            />
          </div>

          {draft.type === "textarea" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Character limit
              </label>
              <input
                type="number"
                value={draft.charLimit ?? 2000}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    charLimit: Math.max(100, Math.min(10000, parseInt(e.target.value) || 2000)),
                  })
                }
                min={100}
                max={10000}
                className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDraft({ ...draft, required: !draft.required })}
              className={cn(
                "relative w-9 h-5 rounded-full transition-all",
                draft.required ? "bg-gray-900" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                  draft.required ? "left-4.5" : "left-0.5"
                )}
              />
            </button>
            <span className="text-sm text-gray-600">Required</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={adding ? saveAdd : saveEdit}
              disabled={!draft.label}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              {adding ? "Add Field" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {!adding && !editing && (
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-4 py-2.5 w-full justify-center transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      )}

      {/* Live preview */}
      {fields.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Preview
          </p>
          <div className="space-y-3 pointer-events-none">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                  {f.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    readOnly
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 resize-none"
                  />
                ) : (
                  <input
                    readOnly
                    placeholder={f.placeholder}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
