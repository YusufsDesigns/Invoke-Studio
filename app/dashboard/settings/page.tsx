"use client";

import { useState, useEffect, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [payoutEmail, setPayoutEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        setPayoutEmail(session?.user?.email ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = () => {
    setError(null);
    setSaved(false);
    startSave(async () => {
      try {
        const res = await fetch("/api/dashboard/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payoutEmail }),
        });
        if (!res.ok) {
          setError("Failed to save. Please try again.");
          return;
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
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
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your payout preferences</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Payout Email</h2>
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            This is where Locus sends your USDC when you withdraw. You&apos;ll get an email with a
            claim link. No Locus account needed in advance.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={payoutEmail}
            onChange={(e) => setPayoutEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:border-gray-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={save}
          disabled={saving || !payoutEmail}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
