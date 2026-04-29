"use client";

import { useState, useEffect, useTransition } from "react";
import { DollarSign, TrendingUp, Activity, Check, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EarningRow {
  id: string;
  amountUsdc: number;
  status: string;
  createdAt: string;
  run: { tool: { name: string } };
}

interface EarningsData {
  pendingBalance: number;
  totalEarned: number;
  totalRuns: number;
  earnings: EarningRow[];
  payoutEmail: string;
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, startWithdraw] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/earnings")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = () => {
    startWithdraw(async () => {
      try {
        const res = await fetch("/api/withdrawals", { method: "POST" });
        if (!res.ok) throw new Error();
        setWithdrawResult("success");
        // Refresh data
        const fresh = await fetch("/api/dashboard/earnings").then((r) => r.json());
        setData(fresh);
      } catch {
        setWithdrawResult("error");
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

  const d = data ?? { pendingBalance: 0, totalEarned: 0, totalRuns: 0, earnings: [], payoutEmail: "" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-400 mt-0.5">80% of every run goes to you</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Available</span>
          </div>
          <p className="text-3xl font-semibold text-gray-900 tracking-tight">
            ${d.pendingBalance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">USDC</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Time</span>
          </div>
          <p className="text-3xl font-semibold text-gray-900 tracking-tight">
            ${d.totalEarned.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">USDC earned</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Runs</span>
          </div>
          <p className="text-3xl font-semibold text-gray-900 tracking-tight">{d.totalRuns}</p>
          <p className="text-xs text-gray-400 mt-1">completed runs</p>
        </div>
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Withdraw Earnings</h2>
        <p className="text-xs text-gray-400 mb-4">
          Sent via email — no crypto account needed. You&apos;ll get a claim link from Locus.
        </p>

        {withdrawResult === "success" ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Check your email for the claim link.</span>
          </div>
        ) : withdrawResult === "error" ? (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Withdrawal failed. Please try again.</span>
          </div>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            disabled={d.pendingBalance === 0 || withdrawing}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
          >
            Withdraw ${d.pendingBalance.toFixed(2)} USDC
          </button>
        )}
      </div>

      {/* Recent earnings */}
      {d.earnings.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Earnings</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {d.earnings.slice(0, 20).map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-gray-700">{e.run?.tool?.name ?? "Unknown tool"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    ${e.amountUsdc.toFixed(2)}
                  </span>
                  <span className={cn(
                    "text-xs rounded-full px-2 py-0.5 font-medium",
                    e.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {e.status === "PENDING" ? "Pending" : "Withdrawn"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Confirm Withdrawal</h3>
            <p className="text-sm text-gray-500 mb-1">
              Amount: <strong>${d.pendingBalance.toFixed(2)} USDC</strong>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Sending to: <strong>{d.payoutEmail}</strong>
            </p>
            <p className="text-xs text-gray-400 mb-6 bg-gray-50 rounded-lg p-3">
              Funds arrive via email claim link from Locus. No prior crypto account needed.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowModal(false); handleWithdraw(); }}
                disabled={withdrawing}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2.5 text-sm font-semibold transition-all"
              >
                {withdrawing ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg py-2.5 text-sm font-medium transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
