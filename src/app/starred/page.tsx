"use client";
import { useMemo } from "react";
import { useInteractions } from "@/components/BookmarkProvider";
import ProgramCard from "@/components/ProgramCard";
import { getAllPrograms } from "@/lib/programs";
import Link from "next/link";

export default function StarredPage() {
  const { starred } = useInteractions();
  const allPrograms = useMemo(() => getAllPrograms(), []);
  const starredPrograms = allPrograms.filter((p) => starred.includes(p.id));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Starred</h2>
        <p className="text-sm text-gray-500">Opportunities you&apos;ve saved for later.</p>
      </div>

      {starredPrograms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">☆</p>
          <p className="text-gray-500 text-lg mb-2">No starred opportunities yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Tap the star ☆ on any opportunity to save it here.
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
            {starredPrograms.length} opportunit{starredPrograms.length !== 1 ? "ies" : "y"} starred
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {starredPrograms.map((p) => (
              <ProgramCard key={p.id} program={p} clickableCard={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
