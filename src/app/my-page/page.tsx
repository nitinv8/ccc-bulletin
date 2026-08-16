"use client";
import { useState, useMemo } from "react";
import { useInteractions } from "@/components/BookmarkProvider";
import ProgramCard from "@/components/ProgramCard";
import { getAllPrograms } from "@/lib/programs";
import Link from "next/link";

type Tab = "starred" | "archive";

export default function MyPage() {
  const { starred, archived } = useInteractions();
  const [tab, setTab] = useState<Tab>("starred");

  const allPrograms = useMemo(() => getAllPrograms(), []);

  const starredPrograms = allPrograms.filter((p) => starred.includes(p.id));
  const archivedPrograms = allPrograms.filter((p) => archived.includes(p.id));

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: "starred", label: "Starred", count: starredPrograms.length, icon: "★" },
    { key: "archive", label: "Archived", count: archivedPrograms.length, icon: "🗄" },
  ];

  const list = tab === "starred" ? starredPrograms : archivedPrograms;

  const emptyState = {
    starred: {
      icon: "☆",
      title: "No starred opportunities yet",
      body: "Tap the star ☆ on any opportunity to save it here.",
    },
    archive: {
      icon: "🗄",
      title: "Archive is empty",
      body: "Tap Archive on any card to move it here once you've read it.",
    },
  }[tab];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">My Page</h2>
        <p className="text-sm text-gray-500">
          Your saved opportunities and archived items.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === t.key ? "bg-yellow-400 text-yellow-900" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                tab === t.key ? "bg-yellow-500 text-yellow-900" : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">{emptyState.icon}</p>
          <p className="text-gray-500 text-lg mb-2">{emptyState.title}</p>
          <p className="text-gray-400 text-sm mb-4">{emptyState.body}</p>
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
            {list.length} opportunit{list.length !== 1 ? "ies" : "y"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((p) => (
              <ProgramCard
                key={p.id}
                program={p}
                showArchiveAction={true}
                clickableCard={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
