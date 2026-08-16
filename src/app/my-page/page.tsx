"use client";
import { useState, useMemo } from "react";
import { useInteractions } from "@/components/BookmarkProvider";
import ProgramCard from "@/components/ProgramCard";
import { getAllPrograms } from "@/lib/programs";
import Link from "next/link";

type Tab = "mypage" | "starred" | "archive";

export default function MyPage() {
  const { starred, archived } = useInteractions();
  const [tab, setTab] = useState<Tab>("mypage");

  const allPrograms = useMemo(() => getAllPrograms(), []);

  const starredPrograms = allPrograms.filter((p) => starred.includes(p.id));
  const archivedPrograms = allPrograms.filter((p) => archived.includes(p.id));

  const tabs: { key: Tab; label: string; count: number; icon: string }[] = [
    { key: "mypage", label: "My Page", count: starredPrograms.length + archivedPrograms.length, icon: "🏠" },
    { key: "starred", label: "Starred", count: starredPrograms.length, icon: "★" },
    { key: "archive", label: "Archived", count: archivedPrograms.length, icon: "🗄" },
  ];

  const list = tab === "starred" ? starredPrograms : archivedPrograms;

  const emptyState: Record<"starred" | "archive", { icon: string; title: string; body: string }> = {
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
  };

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

      {tab === "mypage" ? (
        <div>
          {starredPrograms.length === 0 && archivedPrograms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-gray-500 text-lg mb-2">You haven&apos;t saved anything yet</p>
              <p className="text-gray-400 text-sm mb-4">
                Browse programs and star the ones you&apos;re interested in.
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
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                  <p className="text-3xl font-bold text-yellow-700 mb-1">{starredPrograms.length}</p>
                  <p className="text-sm font-medium text-yellow-600">Starred</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="text-3xl font-bold text-gray-600 mb-1">{archivedPrograms.length}</p>
                  <p className="text-sm font-medium text-gray-500">Archived</p>
                </div>
              </div>

              {/* Preview of starred programs */}
              {starredPrograms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Starred</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {starredPrograms.slice(0, 4).map((p) => (
                      <ProgramCard
                        key={p.id}
                        program={p}
                        showArchiveAction={true}
                        clickableCard={true}
                      />
                    ))}
                  </div>
                  {starredPrograms.length > 4 && (
                    <button
                      onClick={() => setTab("starred")}
                      className="mt-4 text-sm text-yellow-700 font-medium hover:underline"
                    >
                      View all starred →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {list.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-4xl mb-3">{emptyState[tab as "starred" | "archive"].icon}</p>
              <p className="text-gray-500 text-lg mb-2">{emptyState[tab as "starred" | "archive"].title}</p>
              <p className="text-gray-400 text-sm mb-4">{emptyState[tab as "starred" | "archive"].body}</p>
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
        </>
      )}
    </div>
  );
}
