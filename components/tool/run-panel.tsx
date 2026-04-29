"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { InputForm } from "./input-form";
import { ResultDisplay } from "./result-display";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";

type FieldSchema = {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  charLimit?: number;
  required: boolean;
};

type State = "FORM" | "CHECKOUT" | "PROCESSING" | "RESULT" | "FAILED";

interface RunPanelProps {
  toolId: string;
  toolName: string;
  priceUsdc: number;
  inputSchema: FieldSchema[];
}

type LocusCheckoutComponent = React.ComponentType<{
  sessionId: string;
  checkoutUrl?: string;
  onSuccess: () => void;
  onCancel: () => void;
}>;

function CheckoutWrapper({
  sessionId,
  checkoutUrl,
  onSuccess,
  onCancel,
}: {
  sessionId: string;
  checkoutUrl?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [Comp, setComp] = useState<LocusCheckoutComponent | null>(null);

  useEffect(() => {
    import("@withlocus/checkout-react")
      .then((mod) => {
        const C = mod.LocusCheckout ?? (mod as Record<string, unknown>).default;
        setComp(() => C as LocusCheckoutComponent);
      })
      .catch(() => setComp(null));
  }, []);

  if (!Comp) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">Loading checkout…</p>
      </div>
    );
  }

  return (
    <Comp
      sessionId={sessionId}
      checkoutUrl={checkoutUrl}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

export function RunPanel({ toolId, toolName, priceUsdc, inputSchema }: RunPanelProps) {
  const searchParams = useSearchParams();
  const initialRunId = searchParams.get("run");

  const [state, setState] = useState<State>(initialRunId ? "PROCESSING" : "FORM");
  const [runId, setRunId] = useState<string | null>(initialRunId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // savedInputs persists across all state transitions so the form always re-populates
  const [savedInputs, setSavedInputs] = useState<Record<string, string>>({});
  // wasPaid: true once payment is confirmed — enables free retry if AI fails
  const [wasPaid, setWasPaid] = useState(!!initialRunId);
  // pollingKey: incrementing this re-triggers the polling effect without changing runId
  const [pollingKey, setPollingKey] = useState(0);

  // Poll the moment we have a runId — covers both the onSuccess callback path
  // (embedded checkout) and the successUrl redirect path (?run= in URL).
  // Stops automatically when runId is cleared (cancel / run-again).
  // pollingKey can be incremented to force-restart polling on the same runId (retry).
  useEffect(() => {
    if (!runId) return;

    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
      try {
        const res = await fetch(`/api/runs/${runId}`);
        const data = await res.json();

        if (data.status === "PAID") {
          setWasPaid(true);
          setState((prev) =>
            prev === "CHECKOUT" || prev === "PROCESSING" ? "PROCESSING" : prev
          );
        } else if (data.status === "COMPLETED" && !stopped) {
          stopped = true;
          clearInterval(interval);
          setWasPaid(true);
          setResult(data.result);
          setState("RESULT");
        } else if (data.status === "FAILED" && !stopped) {
          stopped = true;
          clearInterval(interval);
          if (data.txHash) setWasPaid(true);
          setState("FAILED");
        }
      } catch {
        // network hiccup — will retry on next interval tick
      }
    }, 2000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [runId, pollingKey]);

  const handleFormSubmit = async (inputs: Record<string, string>) => {
    setLoading(true);
    setSavedInputs(inputs);
    try {
      const res = await fetch(`/api/tools/${toolId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      if (!res.ok) throw new Error("Failed to create run");
      const data = await res.json();
      setRunId(data.runId);
      setSessionId(data.sessionId);
      setCheckoutUrl(data.checkoutUrl ?? null);
      setState("CHECKOUT");
    } catch {
      setState("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setWasPaid(true);
    setState("PROCESSING");
  };

  const handleRetry = async () => {
    if (!runId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/runs/${runId}/retry`, { method: "POST" });
      if (!res.ok) throw new Error("Retry failed");
      setState("PROCESSING");
      setPollingKey((k) => k + 1);
    } catch {
      // retry request failed — stay in FAILED state
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCheckout = () => {
    // Clear runId so polling stops — the PENDING run is abandoned.
    // savedInputs is preserved so the form re-populates.
    setRunId(null);
    setSessionId(null);
    setCheckoutUrl(null);
    setState("FORM");
  };

  const handleRunAgain = () => {
    // Clear run state. Polling stops because runId becomes null.
    // savedInputs intentionally kept — form re-populates with previous values.
    setResult(null);
    setRunId(null);
    setSessionId(null);
    setCheckoutUrl(null);
    setWasPaid(false);
    setPollingKey(0);
    setState("FORM");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-gray-900 text-base mb-1">Run this tool</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            ${priceUsdc.toFixed(2)}
          </span>
          <span className="text-sm text-gray-400">USDC per run</span>
        </div>
      </div>

      {state === "FORM" && (
        <InputForm
          schema={inputSchema}
          priceUsdc={priceUsdc}
          onSubmit={handleFormSubmit}
          loading={loading}
          initialValues={savedInputs}
        />
      )}

      {state === "CHECKOUT" && sessionId && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            Complete payment to run this tool
          </p>
          <CheckoutWrapper
            sessionId={sessionId}
            checkoutUrl={checkoutUrl ?? undefined}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancelCheckout}
          />
          <button
            onClick={handleCancelCheckout}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:text-gray-700"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      )}

      {state === "PROCESSING" && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
            <Loader2 className="w-10 h-10 animate-spin text-gray-900 absolute inset-0" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Running {toolName}…</p>
            <p className="text-xs text-gray-400 mt-1">
              Claude is processing your input. 5–15 seconds.
            </p>
          </div>
        </div>
      )}

      {state === "RESULT" && result && (
        <ResultDisplay result={result} onRunAgain={handleRunAgain} />
      )}

      {state === "FAILED" && (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Something went wrong</p>
            <p className="text-xs text-gray-400 mt-1 max-w-55">
              {wasPaid
                ? "The AI failed to process your request. Your payment is still valid — retry for free."
                : "The tool execution failed. Please try again."}
            </p>
          </div>
          {wasPaid ? (
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="text-sm font-medium bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 transition-all"
              >
                {loading ? "Retrying…" : "Retry for free"}
              </button>
              <button
                onClick={handleRunAgain}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                Start a new run instead →
              </button>
            </div>
          ) : (
            <button
              onClick={handleRunAgain}
              className="text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-5 py-2 transition-all"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
