import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Invoke Studio" width={22} height={22} className="rounded-md" />
          <div>
            <span className="font-semibold text-gray-900 text-sm">Invoke Studio</span>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Pay per run. Built for humans and agents.</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/marketplace" className="hover:text-gray-700 transition-colors">
            Marketplace
          </Link>
          <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
        </nav>

        <p className="text-xs text-gray-500">
          © 2026 Invoke Studio. Powered by Locus.
        </p>
      </div>
    </footer>
  );
}
