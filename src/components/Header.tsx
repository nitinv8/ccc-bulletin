"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-red-700 font-bold text-sm">
            CCC
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">CCC Bulletin</h1>
            <p className="text-[11px] text-gray-500 leading-tight">The Shri Ram School</p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/")
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Programs
          </Link>
          <Link
            href="/my-page"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/my-page")
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            &#9733; My Page
          </Link>
          <Link
            href="/about"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive("/about")
                ? "bg-yellow-100 text-yellow-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
