"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xs tracking-tight shadow-sm">
            CCC
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">CCC Bulletin</h1>
            <p className="text-[10px] text-gray-400 leading-tight">The Shri Ram School</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-yellow-400 text-yellow-900 shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            All Programs
          </Link>
          <Link
            href="/my-page"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/my-page")
                ? "bg-yellow-400 text-yellow-900 shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            ★ My Page
          </Link>
          <Link
            href="/about"
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/about")
                ? "bg-yellow-400 text-yellow-900 shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
