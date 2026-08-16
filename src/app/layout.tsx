import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { BookmarkProvider } from "@/components/BookmarkProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CCC Bulletin - The Shri Ram School",
  description:
    "Career Counselling Centre Weekly Bulletin for students of The Shri Ram School, Aravali & Moulsari. Browse programs, workshops, internships, and competitions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <BookmarkProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
            Career Counselling Centre &middot; The Shri Ram School, Aravali &amp; Moulsari
            <span className="mx-2">&middot;</span>
            <a href="/admin" className="hover:text-gray-600 hover:underline">
              CCC Staff Admin
            </a>
          </footer>
        </BookmarkProvider>
      </body>
    </html>
  );
}
