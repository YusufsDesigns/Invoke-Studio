"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { GitBranch, Plus } from "lucide-react";

export function CtaBanner() {
  const { data: session } = useSession();

  return (
    <section className="bg-gray-950 py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
          Start building. Start earning.
        </h2>
        <p className="text-gray-400 mb-8 text-base">
          Publish your first tool in minutes. It&apos;s completely free.
        </p>

        {session ? (
          <Link
            href="/dashboard/tools/new"
            className="inline-flex items-center gap-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-lg px-6 py-3 text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Create a Tool
          </Link>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="inline-flex items-center gap-2.5 bg-white hover:bg-gray-100 text-gray-900 rounded-lg px-6 py-3 text-sm font-semibold transition-all"
          >
            <GitBranch className="w-4 h-4" />
            Sign in with GitHub
          </button>
        )}
      </div>
    </section>
  );
}
