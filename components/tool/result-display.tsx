"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, RotateCcw, X } from "lucide-react";

interface ResultDisplayProps {
  result: string;
  onRunAgain: () => void;
}

// ---------------------------------------------------------------------------
// Inline markdown: **bold** and `code`
// ---------------------------------------------------------------------------
function InlineContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold text-gray-900">
              {p.slice(2, -2)}
            </strong>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code
              key={i}
              className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[0.8em] font-mono"
            >
              {p.slice(1, -1)}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Block markdown parser
// Handles: h1–h4, hr, bullets, numbered lists, tables, code fences, paragraphs
// ---------------------------------------------------------------------------
function parseBlocks(text: string): React.ReactNode[] {
  const segments = text.split(/(```[\s\S]*?```)/g);
  const out: React.ReactNode[] = [];
  let key = 0;

  for (const seg of segments) {
    if (seg.startsWith("```")) {
      const inner = seg.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
      out.push(
        <pre
          key={key++}
          className="bg-gray-900 text-gray-100 rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto whitespace-pre my-4 leading-relaxed"
        >
          {inner}
        </pre>
      );
      continue;
    }

    const lines = seg.split("\n");
    let i = 0;

    while (i < lines.length) {
      const raw = lines[i];
      const t = raw.trim();

      if (!t) { i++; continue; }

      // Headings
      if (t.startsWith("#### ")) {
        out.push(<h4 key={key++} className="text-sm font-semibold text-gray-800 mt-3 mb-0.5"><InlineContent text={t.slice(5)} /></h4>);
        i++; continue;
      }
      if (t.startsWith("### ")) {
        out.push(<h3 key={key++} className="text-base font-semibold text-gray-900 mt-5 mb-1"><InlineContent text={t.slice(4)} /></h3>);
        i++; continue;
      }
      if (t.startsWith("## ")) {
        out.push(<h2 key={key++} className="text-lg font-semibold text-gray-900 mt-6 mb-1 first:mt-0">{t.slice(3)}</h2>);
        i++; continue;
      }
      if (t.startsWith("# ")) {
        out.push(<h1 key={key++} className="text-xl font-bold text-gray-900 mt-6 mb-2 first:mt-0">{t.slice(2)}</h1>);
        i++; continue;
      }

      // Horizontal rule
      if (t === "---" || t === "***" || t === "___") {
        out.push(<hr key={key++} className="border-gray-200 my-4" />);
        i++; continue;
      }

      // Bullet list — collect consecutive bullets
      if (t.startsWith("- ") || t.startsWith("* ")) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          items.push(lines[i].trim().slice(2));
          i++;
        }
        out.push(
          <ul key={key++} className="list-disc list-outside ml-5 space-y-1 my-3">
            {items.map((item, j) => (
              <li key={j} className="text-sm text-gray-700 leading-relaxed">
                <InlineContent text={item} />
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Numbered list
      if (/^\d+\.\s/.test(t)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
          i++;
        }
        out.push(
          <ol key={key++} className="list-decimal list-outside ml-5 space-y-1 my-3">
            {items.map((item, j) => (
              <li key={j} className="text-sm text-gray-700 leading-relaxed">
                <InlineContent text={item} />
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Markdown table
      if (t.startsWith("|") && t.endsWith("|")) {
        const rows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          const row = lines[i].trim();
          if (/^\|[-: |]+\|$/.test(row)) { i++; continue; } // separator
          rows.push(row.slice(1, -1).split("|").map((c) => c.trim()));
          i++;
        }
        if (rows.length > 0) {
          out.push(
            <div key={key++} className="overflow-x-auto my-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    {rows[0].map((cell, ci) => (
                      <th key={ci} className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 1 ? "bg-gray-50/60" : ""}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-gray-200 px-3 py-2 text-gray-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Paragraph
      out.push(
        <p key={key++} className="text-sm text-gray-700 leading-relaxed my-2">
          <InlineContent text={raw} />
        </p>
      );
      i++;
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Modal (portalled to document.body)
// ---------------------------------------------------------------------------
function ResultModal({
  result,
  onClose,
  onRunAgain,
}: {
  result: string;
  onClose: () => void;
  onRunAgain: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard + scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Result ready</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {parseBlocks(result)}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 flex-none">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2 transition-all hover:border-gray-300"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-green-500" />Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5" />Copy result</>
            )}
          </button>
          <button
            onClick={() => { onClose(); onRunAgain(); }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2 transition-all hover:border-gray-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Run again
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Public export — compact panel state + auto-opens modal
// ---------------------------------------------------------------------------
export function ResultDisplay({ result, onRunAgain }: ResultDisplayProps) {
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(true); // auto-open on mount

  useEffect(() => setMounted(true), []);

  const handleClose = useCallback(() => setModalOpen(false), []);
  const handleRunAgain = useCallback(() => {
    setModalOpen(false);
    onRunAgain();
  }, [onRunAgain]);

  return (
    <>
      {/* Compact in-panel state shown while modal is closed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
            <Check className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-green-700">Result ready</span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 transition-all"
        >
          View result
        </button>
        <button
          onClick={onRunAgain}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-4 py-2 transition-all hover:border-gray-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Run again
        </button>
      </div>

      {/* Portal modal */}
      {mounted && modalOpen && (
        <ResultModal result={result} onClose={handleClose} onRunAgain={handleRunAgain} />
      )}
    </>
  );
}
