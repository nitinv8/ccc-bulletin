"use client";
import Link from "next/link";
import { useBookmarks } from "./BookmarkProvider";

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
  mode: string;
  tags: string[];
  time?: string;
}

export default function ProgramCard({ program }: { program: Program }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(program.id);

  const typeColors: Record<string, string> = {
    "Summer Program": "bg-orange-100 text-orange-700",
    Competition: "bg-blue-100 text-blue-700",
    Workshop: "bg-purple-100 text-purple-700",
    Internship: "bg-green-100 text-green-700",
    "In-Person Session": "bg-red-100 text-red-700",
    "Virtual Session": "bg-teal-100 text-teal-700",
    Podcast: "bg-pink-100 text-pink-700",
    Information: "bg-gray-100 text-gray-700",
  };

  const colorClass = typeColors[program.type] || "bg-gray-100 text-gray-700";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative group">
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleBookmark(program.id);
        }}
        className={`absolute top-4 right-4 text-xl transition-transform hover:scale-110 ${
          bookmarked ? "text-yellow-500" : "text-gray-300 group-hover:text-gray-400"
        }`}
        title={bookmarked ? "Remove bookmark" : "Bookmark this"}
      >
        {bookmarked ? "★" : "☆"}
      </button>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {program.type}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
          Grades {program.grades}
        </span>
        {program.mode && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
            {program.mode}
          </span>
        )}
      </div>

      <Link href={`/program/${program.id}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-yellow-700 transition-colors pr-8">
          {program.title}
        </h3>
      </Link>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.overview}</p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {program.date && (
          <span className="flex items-center gap-1">
            <span>&#128197;</span> {program.date}
          </span>
        )}
        {program.deadline && (
          <span className="flex items-center gap-1 text-red-500 font-medium">
            <span>&#9200;</span> Deadline: {program.deadline}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
        {program.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[11px]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
