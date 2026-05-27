"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useBookmarks } from "@/components/BookmarkProvider";
import bulletinData from "@/data/bulletins.json";

export default function ProgramPage() {
  const params = useParams();
  const id = params.id as string;
  const bulletin = bulletinData.bulletins[0];
  const program = bulletin.programs.find((p) => p.id === id);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (!program) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Program not found</p>
        <Link href="/" className="text-yellow-600 hover:underline mt-2 inline-block">
          Back to all programs
        </Link>
      </div>
    );
  }

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
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-gray-500 hover:text-yellow-700 mb-4 inline-block">
        &larr; Back to all programs
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {program.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
              Grades {program.grades}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
              {program.mode}
            </span>
          </div>
          <button
            onClick={() => toggleBookmark(program.id)}
            className={`text-2xl transition-transform hover:scale-110 ${
              bookmarked ? "text-yellow-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">{program.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {program.date && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128197;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date</p>
                <p className="text-sm text-gray-800">{program.date}</p>
              </div>
            </div>
          )}
          {program.deadline && (
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
              <span className="text-lg">&#9200;</span>
              <div>
                <p className="text-xs text-red-500 font-medium">Deadline</p>
                <p className="text-sm text-red-700 font-medium">{program.deadline}</p>
              </div>
            </div>
          )}
          {program.venue && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128205;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Venue</p>
                <p className="text-sm text-gray-800">{program.venue}</p>
              </div>
            </div>
          )}
          {program.time && (
            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
              <span className="text-lg">&#128336;</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Time</p>
                <p className="text-sm text-gray-800">{program.time}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
            <span className="text-lg">&#127979;</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Campus</p>
              <p className="text-sm text-gray-800">{program.campus}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
            <span className="text-lg">&#128101;</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">For</p>
              <p className="text-sm text-gray-800">{program.audience}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">{program.overview}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100">
          {program.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
