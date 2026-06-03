"use client";
import { useBookmarks } from "@/components/BookmarkProvider";
import ProgramCard from "@/components/ProgramCard";
import bulletinData from "@/data/bulletins.json";
import Link from "next/link";

interface Program {
  id: string;
  title: string;
  type: string;
  category: string;
  campus: string;
  grades: string;
  audience: string;
  overview: string;
  date?: string;
  deadline?: string;
  venue?: string;
  time?: string;
  mode: string;
  tags: string[];
}

export default function MyPage() {
  const { bookmarks } = useBookmarks();
  const programs = bulletinData.bulletins.flatMap((b) => b.programs) as Program[];
  const saved = programs.filter((p) => bookmarks.includes(p.id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Page</h2>
        <p className="text-sm text-gray-500">
          Programs you have bookmarked. Click the star on any program to save it here.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">&#9734;</p>
          <p className="text-gray-500 text-lg mb-2">No bookmarks yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Browse programs and click the star icon to save them here
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {saved.length} saved program{saved.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saved.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
