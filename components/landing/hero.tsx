"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { BeamsBackground } from "@/components/ui/beams-background";
import { signIn, useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const { data: session } = useSession();

  return (
    <BeamsBackground className="min-h-screen" intensity="strong">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Invoke Studio" width={28} height={28} className="rounded-md" />
          <span className="text-white font-semibold text-[15px] tracking-tight">Invoke Studio</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link href="/marketplace" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
            Marketplace
          </Link>
          <Link href="/#how-it-works" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-150">
            How it Works
          </Link>
        </div>

        <div>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero content */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium text-white/70 mb-8 backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 motion-safe:animate-pulse" />
          Now in Beta
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight text-white text-balance max-w-3xl leading-[1.05]"
        >
          The Marketplace for{" "}
          <span className="text-cyan-400">AI‑Powered</span>{" "}
          Tools
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-white/55 max-w-lg leading-relaxed"
        >
          Publish your expertise as a pay-per-run tool. Humans and AI agents
          pay in USDC. You earn automatically.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex items-center gap-3 flex-wrap justify-center"
        >
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg px-6 py-3 text-sm font-semibold transition-all shadow-lg shadow-cyan-500/25"
          >
            Explore Tools
          </Link>
          {session ? (
            <Link
              href="/dashboard/tools/new"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg px-6 py-3 text-sm font-semibold transition-all backdrop-blur-sm"
            >
              Start Selling
            </Link>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-lg px-6 py-3 text-sm font-semibold transition-all backdrop-blur-sm"
            >
              Start Selling
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex items-center gap-6 text-sm text-white/35"
        >
          <span>40+ Tools</span>
          <span className="h-1 w-1 rounded-full bg-white/25" />
          <span>$0 Setup</span>
          <span className="h-1 w-1 rounded-full bg-white/25" />
          <span>Agent‑Native</span>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: "transform" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </BeamsBackground>
  );
}
