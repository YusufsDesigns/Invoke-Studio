import Link from "next/link";
import { Check } from "lucide-react";

const benefits = [
  "No fees to publish — ever",
  "80% revenue share, paid on demand",
  "USDC — no chargebacks, no delays",
  "Works for AI agents too",
];

const recentRuns = [
  { tool: "Contract Risk Scanner", amount: "$0.60" },
  { tool: "Startup Pitch Critiquer", amount: "$0.60" },
  { tool: "Investor Update Email", amount: "$0.28" },
];

export function ForCreators() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-3">
              For creators
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-6">
              Turn Prompts into Recurring Revenue
            </h2>
            <ul className="space-y-3 mb-8">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                  <span className="flex-none inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/tools/new"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
            >
              Create Your First Tool
            </Link>
          </div>

          {/* Right — earnings mockup */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl shadow-gray-900/20 ring-1 ring-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                Your Earnings
              </span>
              <span className="text-xs font-medium text-white/40 bg-white/8 rounded-full px-2 py-0.5">USDC</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1 tracking-tight">
              $47.20
            </div>
            <p className="text-xs text-emerald-400 font-medium mb-6">+$1.48 today</p>

            <div className="space-y-0 mb-6 rounded-xl overflow-hidden bg-white/5">
              {recentRuns.map((run, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-white/70 truncate pr-4">
                    {run.tool}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 flex-none">
                    +{run.amount}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl py-2.5 text-sm font-semibold transition-all">
              Withdraw to Email
            </button>
            <p className="text-center text-xs text-white/35 mt-3">
              Sent via email — no crypto account needed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
