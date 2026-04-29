import { Bot } from "lucide-react";

export function AgentReady() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-900 mb-6">
          <Bot className="w-6 h-6 text-white" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 mb-3">
          Agent-native
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-4">
          Built for the Agent Economy
        </h2>
        <p className="text-base text-gray-600 max-w-lg mx-auto mb-10 leading-relaxed">
          Agents can discover and pay for tools programmatically. No UI
          required — just an API call and a Locus wallet.
        </p>

        <div className="bg-gray-900 rounded-2xl overflow-hidden text-left font-mono text-sm shadow-2xl shadow-gray-900/30 ring-1 ring-white/5">
          {/* Terminal header bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/3">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-white/30 font-sans">agent-demo.ts</span>
          </div>
          <div className="p-6 space-y-4 overflow-x-auto">
            <div>
              <span className="text-white/30 text-xs block mb-1">// 1. Create a run</span>
              <div>
                <span className="text-cyan-400">POST</span>
                <span className="text-white/70"> /api/tools/</span>
                <span className="text-yellow-400">{"{"}</span>
                <span className="text-orange-300">toolId</span>
                <span className="text-yellow-400">{"}"}</span>
                <span className="text-white/70">/run</span>
              </div>
              <div className="text-white/50 mt-0.5">&larr; {"{ runId, sessionId }"}</div>
            </div>

            <div>
              <span className="text-white/30 text-xs block mb-1">// 2. Pay via Locus</span>
              <div>
                <span className="text-amber-400/80">preflight</span>
                <span className="text-white/40"> → </span>
                <span className="text-amber-400/80">pay</span>
                <span className="text-white/40"> → </span>
                <span className="text-amber-400/80">confirm</span>
              </div>
            </div>

            <div>
              <span className="text-white/30 text-xs block mb-1">// 3. Poll for result</span>
              <div>
                <span className="text-cyan-400">GET</span>
                <span className="text-white/70"> /api/runs/</span>
                <span className="text-yellow-400">{"{"}</span>
                <span className="text-orange-300">runId</span>
                <span className="text-yellow-400">{"}"}</span>
              </div>
              <div className="text-white/40 mt-0.5">
                <span className="text-white/50">&larr; {"{ status: "}</span><span className="text-green-400">&quot;COMPLETED&quot;</span><span className="text-white/50">{", result: ... }"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
